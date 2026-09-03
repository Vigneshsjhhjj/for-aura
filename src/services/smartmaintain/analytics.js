const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const riskRank = {
  critical: 3,
  watch: 2,
  stable: 1
};

function metricPressure(value, normal, limit) {
  if (limit <= normal) {
    return 0;
  }
  return clamp((value - normal) / (limit - normal), 0, 1.35);
}

function latestReadings(inspections, count = 6) {
  return [...inspections]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-count);
}

function calculateTrend(readings, field) {
  if (readings.length < 2) {
    return 0;
  }

  const firstHalf = readings.slice(0, Math.max(1, Math.floor(readings.length / 2)));
  const secondHalf = readings.slice(Math.floor(readings.length / 2));
  const average = (items) =>
    items.reduce((total, item) => total + Number(item[field] ?? 0), 0) / items.length;

  return average(secondHalf) - average(firstHalf);
}

function formatTimeframe(hours) {
  if (hours <= 24) {
    return "within 24 hours";
  }
  if (hours <= 72) {
    return `within ${Math.ceil(hours / 24)} days`;
  }
  if (hours <= 168) {
    return "within 1 week";
  }
  return `within ${Math.ceil(hours / 168)} weeks`;
}

function explainFactor(label, value, normal, unit, trend = 0) {
  const direction = value >= normal ? "above" : "below";
  const percent = normal ? Math.abs(((value - normal) / normal) * 100) : 0;
  const trendText = Math.abs(trend) > 0.2 ? `, trend ${trend > 0 ? "up" : "down"} ${round(Math.abs(trend), 1)} ${unit}` : "";
  return `${label} is ${round(percent)}% ${direction} normal at ${round(value, 1)} ${unit}${trendText}.`;
}

export function analyzeMachine(machine, inspections, workOrders = []) {
  const readings = latestReadings(inspections);
  const latest = readings.at(-1) ?? machine.defaultReading;
  const normal = machine.normal;
  const limits = machine.limits;

  const tempTrend = calculateTrend(readings, "temperatureC");
  const vibrationTrend = calculateTrend(readings, "vibrationMmS");
  const noiseTrend = calculateTrend(readings, "noiseDb");
  const powerTrend = calculateTrend(readings, "powerKw");

  const tempPressure = metricPressure(latest.temperatureC, normal.temperatureC, limits.temperatureC);
  const vibrationPressure = metricPressure(latest.vibrationMmS, normal.vibrationMmS, limits.vibrationMmS);
  const noisePressure = metricPressure(latest.noiseDb, normal.noiseDb, limits.noiseDb);
  const powerPressure = metricPressure(latest.powerKw, normal.powerKw, limits.powerKw);
  const oilPressure = clamp((normal.oilQuality - latest.oilQuality) / Math.max(1, normal.oilQuality - limits.oilQuality), 0, 1.35);
  const trendPressure = clamp(
    tempTrend / 10 + vibrationTrend / 2.5 + noiseTrend / 12 + powerTrend / 8,
    0,
    1.1
  );
  const servicePressure = clamp(machine.hoursSinceService / machine.serviceIntervalHours, 0, 1.25);
  const openCriticalWorkOrders = workOrders.filter(
    (order) => order.machineId === machine.id && order.status !== "closed" && order.priority === "critical"
  ).length;

  const healthScore = Math.round(
    clamp(
      100 -
        tempPressure * 18 -
        vibrationPressure * 24 -
        noisePressure * 10 -
        oilPressure * 16 -
        powerPressure * 11 -
        trendPressure * 8 -
        servicePressure * 13 -
        openCriticalWorkOrders * 6,
      8,
      99
    )
  );

  const bearingProbability = clamp(
    0.08 + vibrationPressure * 0.45 + oilPressure * 0.18 + noisePressure * 0.14 + servicePressure * 0.1,
    0.03,
    0.96
  );
  const motorProbability = clamp(
    0.07 + tempPressure * 0.42 + powerPressure * 0.26 + trendPressure * 0.11 + servicePressure * 0.08,
    0.03,
    0.94
  );
  const beltProbability = clamp(
    0.06 + noisePressure * 0.34 + vibrationPressure * 0.19 + servicePressure * 0.16 + trendPressure * 0.09,
    0.02,
    0.91
  );
  const electricalProbability = clamp(
    0.04 + powerPressure * 0.45 + tempPressure * 0.19 + trendPressure * 0.09,
    0.02,
    0.89
  );

  const predictions = [
    {
      component: "Bearing wear",
      probability: round(bearingProbability, 2),
      driver: "vibration, oil quality, and service age"
    },
    {
      component: "Motor overheating",
      probability: round(motorProbability, 2),
      driver: "temperature and power draw"
    },
    {
      component: "Belt or alignment drift",
      probability: round(beltProbability, 2),
      driver: "noise and vibration movement"
    },
    {
      component: "Electrical overload",
      probability: round(electricalProbability, 2),
      driver: "power draw and thermal load"
    }
  ].sort((a, b) => b.probability - a.probability);

  const topProbability = predictions[0].probability;
  const failureWindowHours = Math.round(
    clamp(480 * (1 - topProbability) * (healthScore / 100) + 12, 8, 720)
  );
  const remainingUsefulLifeHours = Math.round(
    clamp(failureWindowHours * (1.3 - servicePressure * 0.35), 8, machine.serviceIntervalHours)
  );
  const riskLevel = healthScore < 48 || topProbability >= 0.72 ? "critical" : healthScore < 70 || topProbability >= 0.48 ? "watch" : "stable";

  const factors = [];
  if (tempPressure > 0.2) {
    factors.push(explainFactor("Temperature", latest.temperatureC, normal.temperatureC, "C", tempTrend));
  }
  if (vibrationPressure > 0.2) {
    factors.push(explainFactor("Vibration", latest.vibrationMmS, normal.vibrationMmS, "mm/s", vibrationTrend));
  }
  if (noisePressure > 0.2) {
    factors.push(explainFactor("Noise", latest.noiseDb, normal.noiseDb, "dB", noiseTrend));
  }
  if (oilPressure > 0.2) {
    factors.push(`Oil quality dropped to ${round(latest.oilQuality)} out of 100.`);
  }
  if (powerPressure > 0.2) {
    factors.push(explainFactor("Power draw", latest.powerKw, normal.powerKw, "kW", powerTrend));
  }
  if (servicePressure > 0.75) {
    factors.push(`Service age is ${Math.round(servicePressure * 100)}% of the planned interval.`);
  }
  if (factors.length === 0) {
    factors.push("Readings are close to the normal operating band.");
  }

  const recommendationMap = {
    "Bearing wear": "Schedule bearing inspection, lubrication check, and vibration retest before the next long production run.",
    "Motor overheating": "Clean cooling path, inspect motor load, and verify current draw under normal batch conditions.",
    "Belt or alignment drift": "Check belt tension, pulley alignment, guards, and abnormal noise at startup.",
    "Electrical overload": "Inspect panel load, contactor heat, cable terminals, and recent production load changes."
  };

  return {
    machineId: machine.id,
    healthScore,
    riskLevel,
    latestReading: latest,
    predictions: predictions.map((prediction, index) => ({
      ...prediction,
      probabilityPercent: Math.round(prediction.probability * 100),
      timeframeHours: index === 0 ? failureWindowHours : Math.round(failureWindowHours * (1.2 + index * 0.25)),
      timeframe: index === 0 ? formatTimeframe(failureWindowHours) : formatTimeframe(failureWindowHours * (1.2 + index * 0.25))
    })),
    remainingUsefulLifeHours,
    remainingUsefulLife: `${remainingUsefulLifeHours} operating hours`,
    explainability: factors,
    recommendation: recommendationMap[predictions[0].component],
    trend: {
      temperatureC: round(tempTrend, 1),
      vibrationMmS: round(vibrationTrend, 2),
      noiseDb: round(noiseTrend, 1),
      powerKw: round(powerTrend, 1)
    },
    pressures: {
      temperature: round(tempPressure, 2),
      vibration: round(vibrationPressure, 2),
      noise: round(noisePressure, 2),
      oil: round(oilPressure, 2),
      power: round(powerPressure, 2),
      service: round(servicePressure, 2)
    }
  };
}

export function summarizeFleet(analyses, workOrders) {
  const averageHealth = Math.round(
    analyses.reduce((total, item) => total + item.healthScore, 0) / Math.max(1, analyses.length)
  );
  const criticalMachines = analyses.filter((item) => item.riskLevel === "critical").length;
  const watchMachines = analyses.filter((item) => item.riskLevel === "watch").length;
  const highRiskPredictions = analyses.filter((item) => item.predictions[0].probability >= 0.6).length;
  const openWorkOrders = workOrders.filter((order) => order.status !== "closed").length;
  const downtimeAvoidedHours = Math.round(
    analyses.reduce((total, item) => total + (item.riskLevel === "critical" ? 7.5 : item.riskLevel === "watch" ? 3.2 : 0.8), 0)
  );

  return {
    averageHealth,
    criticalMachines,
    watchMachines,
    stableMachines: analyses.length - criticalMachines - watchMachines,
    highRiskPredictions,
    openWorkOrders,
    downtimeAvoidedHours
  };
}

export function buildAlerts(machines, analyses, workOrders) {
  const alerts = [];

  analyses.forEach((analysis) => {
    const machine = machines.find((item) => item.id === analysis.machineId);
    if (!machine) {
      return;
    }

    if (analysis.riskLevel === "critical") {
      alerts.push({
        id: `alert-${machine.id}-critical`,
        severity: "critical",
        title: `${machine.name} needs maintenance`,
        message: `${analysis.predictions[0].component} risk is ${analysis.predictions[0].probabilityPercent}% ${analysis.predictions[0].timeframe}.`,
        machineId: machine.id
      });
    } else if (analysis.riskLevel === "watch") {
      alerts.push({
        id: `alert-${machine.id}-watch`,
        severity: "watch",
        title: `${machine.name} is drifting`,
        message: analysis.explainability[0],
        machineId: machine.id
      });
    }
  });

  workOrders
    .filter((order) => order.status !== "closed" && order.priority === "critical")
    .forEach((order) => {
      alerts.push({
        id: `alert-work-order-${order.id}`,
        severity: "critical",
        title: "Critical work order open",
        message: order.title,
        machineId: order.machineId
      });
    });

  return alerts.slice(0, 8);
}

export function buildWorkforceAssignments(data, analyses) {
  const availableWorkers = data.workers
    .filter((worker) => worker.available && !worker.absent)
    .map((worker) => ({ ...worker, load: 0 }));
  const machinesByRisk = [...data.machines].sort((a, b) => {
    const left = analyses.find((analysis) => analysis.machineId === a.id);
    const right = analyses.find((analysis) => analysis.machineId === b.id);
    return (riskRank[right?.riskLevel] ?? 0) - (riskRank[left?.riskLevel] ?? 0);
  });

  return machinesByRisk.map((machine) => {
    const analysis = analyses.find((item) => item.machineId === machine.id);
    const candidates = availableWorkers
      .map((worker) => {
        const skillMatch = worker.skills.includes(machine.requiredSkill) ? 45 : 0;
        const maintenanceMatch = worker.skills.includes("maintenance") && analysis?.riskLevel !== "stable" ? 18 : 0;
        const loadPenalty = worker.load * 14;
        const score = skillMatch + maintenanceMatch + worker.reliabilityScore * 0.28 - loadPenalty;
        return { worker, score };
      })
      .sort((a, b) => b.score - a.score);

    const selected = candidates[0]?.score > 30 ? candidates[0].worker : null;
    if (selected) {
      selected.load += analysis?.riskLevel === "critical" ? 2 : 1;
    }

    return {
      machineId: machine.id,
      machineName: machine.name,
      riskLevel: analysis?.riskLevel ?? "stable",
      requiredSkill: machine.requiredSkill,
      workerId: selected?.id ?? null,
      workerName: selected?.name ?? "Unassigned",
      shift: selected?.shift ?? "Needs planner",
      confidence: selected ? Math.round(clamp(candidates[0].score, 35, 96)) : 0,
      reason: selected
        ? `${selected.name} matches ${machine.requiredSkill} skill and is available for ${machine.cell}.`
        : `No available worker has the ${machine.requiredSkill} skill right now.`
    };
  });
}
