const state = {
  snapshot: null,
  selectedMachineId: null,
  activeView: "overview"
};

const ui = {
  factoryName: document.querySelector("#factoryName"),
  generatedAt: document.querySelector("#generatedAt"),
  refreshButton: document.querySelector("#refreshButton"),
  fleetHealth: document.querySelector("#fleetHealth"),
  fleetHealthHint: document.querySelector("#fleetHealthHint"),
  criticalMachines: document.querySelector("#criticalMachines"),
  highRiskPredictions: document.querySelector("#highRiskPredictions"),
  downtimeAvoided: document.querySelector("#downtimeAvoided"),
  machineList: document.querySelector("#machineList"),
  selectedMachineName: document.querySelector("#selectedMachineName"),
  selectedMachineMeta: document.querySelector("#selectedMachineMeta"),
  createWorkOrderButton: document.querySelector("#createWorkOrderButton"),
  trendChart: document.querySelector("#trendChart"),
  predictionList: document.querySelector("#predictionList"),
  explainabilityList: document.querySelector("#explainabilityList"),
  inspectionForm: document.querySelector("#inspectionForm"),
  inspectionMachine: document.querySelector("#inspectionMachine"),
  inspectionStatus: document.querySelector("#inspectionStatus"),
  recentInspections: document.querySelector("#recentInspections"),
  knowledgeForm: document.querySelector("#knowledgeForm"),
  knowledgeMachine: document.querySelector("#knowledgeMachine"),
  knowledgeStatus: document.querySelector("#knowledgeStatus"),
  knowledgeEntries: document.querySelector("#knowledgeEntries"),
  sopEntries: document.querySelector("#sopEntries"),
  workerList: document.querySelector("#workerList"),
  assignmentRows: document.querySelector("#assignmentRows"),
  copilotForm: document.querySelector("#copilotForm"),
  copilotQuestion: document.querySelector("#copilotQuestion"),
  copilotAnswer: document.querySelector("#copilotAnswer"),
  alertsList: document.querySelector("#alertsList"),
  nextAction: document.querySelector("#nextAction")
};

boot().catch((error) => {
  document.body.innerHTML = `<main class="fatal-error">SmartMaintain AI could not start: ${escapeHtml(error.message)}</main>`;
});

function boot() {
  bindEvents();
  return refreshSnapshot();
}

function bindEvents() {
  ui.refreshButton.addEventListener("click", refreshSnapshot);

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      document.querySelectorAll(".tab-button").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle("active", view.id === `${state.activeView}View`);
      });
    });
  });

  ui.inspectionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.inspectionStatus.textContent = "Saving inspection...";
    const payload = Object.fromEntries(new FormData(ui.inspectionForm).entries());
    const result = await postJson("/api/inspections", payload);
    state.snapshot = result.snapshot;
    state.selectedMachineId = payload.machineId;
    ui.inspectionStatus.textContent = "Inspection logged and prediction refreshed.";
    render();
  });

  ui.knowledgeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.knowledgeStatus.textContent = "Generating SOP...";
    const payload = Object.fromEntries(new FormData(ui.knowledgeForm).entries());
    const result = await postJson("/api/knowledge", payload);
    state.snapshot = result.snapshot;
    ui.knowledgeStatus.textContent = "Knowledge captured and SOP generated.";
    ui.knowledgeForm.reset();
    render();
  });

  ui.createWorkOrderButton.addEventListener("click", async () => {
    const machine = getSelectedMachine();
    if (!machine) {
      return;
    }
    const prediction = machine.analysis.predictions[0];
    const result = await postJson("/api/work-orders", {
      machineId: machine.id,
      priority: machine.analysis.riskLevel === "critical" ? "critical" : "high",
      title: `${prediction.component} inspection for ${machine.name}`
    });
    state.snapshot = result.snapshot;
    render();
  });

  ui.copilotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = ui.copilotQuestion.value.trim();
    if (!question) {
      return;
    }
    await askCopilot(question);
  });

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      ui.copilotQuestion.value = button.dataset.question;
      await askCopilot(button.dataset.question);
    });
  });
}

async function refreshSnapshot() {
  const snapshot = await fetchJson("/api/snapshot");
  state.snapshot = snapshot;
  if (!state.selectedMachineId || !snapshot.machines.some((machine) => machine.id === state.selectedMachineId)) {
    state.selectedMachineId = [...snapshot.machines].sort((a, b) => a.analysis.healthScore - b.analysis.healthScore)[0]?.id;
  }
  render();
}

function render() {
  renderHeader();
  renderSummary();
  renderMachineList();
  renderSelectors();
  renderOverview();
  renderInspections();
  renderKnowledge();
  renderWorkforce();
  renderAlerts();
}

function renderHeader() {
  ui.factoryName.textContent = state.snapshot.factory.name;
  ui.generatedAt.textContent = `Updated ${formatDateTime(state.snapshot.generatedAt)}`;
}

function renderSummary() {
  const summary = state.snapshot.summary;
  ui.fleetHealth.textContent = `${summary.averageHealth}/100`;
  ui.fleetHealthHint.textContent = `${summary.stableMachines} stable, ${summary.watchMachines} watch`;
  ui.criticalMachines.textContent = summary.criticalMachines;
  ui.highRiskPredictions.textContent = summary.highRiskPredictions;
  ui.downtimeAvoided.textContent = `${summary.downtimeAvoidedHours} h`;
}

function renderMachineList() {
  ui.machineList.innerHTML = state.snapshot.machines
    .sort((a, b) => a.analysis.healthScore - b.analysis.healthScore)
    .map((machine) => {
      const analysis = machine.analysis;
      return `
        <button class="machine-row ${machine.id === state.selectedMachineId ? "active" : ""}" type="button" data-machine-id="${machine.id}">
          <span class="machine-main">
            <strong>${escapeHtml(machine.name)}</strong>
            <small>${escapeHtml(machine.cell)} - ${escapeHtml(machine.type)}</small>
          </span>
          <span class="health-meter" aria-label="Health ${analysis.healthScore} out of 100">
            <span style="width: ${analysis.healthScore}%"></span>
          </span>
          <span class="risk-pill ${analysis.riskLevel}">${analysis.riskLevel}</span>
          <span class="rul">${analysis.remainingUsefulLife}</span>
        </button>
      `;
    })
    .join("");

  ui.machineList.querySelectorAll("[data-machine-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMachineId = button.dataset.machineId;
      render();
    });
  });
}

function renderSelectors() {
  const options = state.snapshot.machines
    .map((machine) => `<option value="${machine.id}">${escapeHtml(machine.name)}</option>`)
    .join("");
  ui.inspectionMachine.innerHTML = options;
  ui.knowledgeMachine.innerHTML = options;
  ui.inspectionMachine.value = state.selectedMachineId;
  ui.knowledgeMachine.value = state.selectedMachineId;

  const machine = getSelectedMachine();
  if (machine) {
    const latest = machine.analysis.latestReading;
    ui.inspectionForm.elements.temperatureC.value = latest.temperatureC;
    ui.inspectionForm.elements.vibrationMmS.value = latest.vibrationMmS;
    ui.inspectionForm.elements.noiseDb.value = latest.noiseDb;
    ui.inspectionForm.elements.oilQuality.value = latest.oilQuality;
    ui.inspectionForm.elements.powerKw.value = latest.powerKw;
  }
}

function renderOverview() {
  const machine = getSelectedMachine();
  if (!machine) {
    return;
  }

  const analysis = machine.analysis;
  ui.selectedMachineName.textContent = machine.name;
  ui.selectedMachineMeta.textContent = `${machine.cell} - ${machine.type} - ${analysis.healthScore}/100 health - ${analysis.remainingUsefulLife} RUL`;
  ui.trendChart.innerHTML = buildTrendChart(machine);
  ui.predictionList.innerHTML = analysis.predictions
    .map(
      (prediction) => `
        <article class="prediction-card">
          <div>
            <strong>${escapeHtml(prediction.component)}</strong>
            <small>${escapeHtml(prediction.driver)}</small>
          </div>
          <div class="prediction-score">
            <span>${prediction.probabilityPercent}%</span>
            <small>${escapeHtml(prediction.timeframe)}</small>
          </div>
        </article>
      `
    )
    .join("");

  ui.explainabilityList.innerHTML = analysis.explainability
    .map((factor) => `<li>${escapeHtml(factor)}</li>`)
    .join("");

  ui.nextAction.innerHTML = `
    <strong>${escapeHtml(machine.name)}</strong>
    <p>${escapeHtml(analysis.recommendation)}</p>
    <span class="risk-pill ${analysis.riskLevel}">${analysis.riskLevel}</span>
  `;
}

function buildTrendChart(machine) {
  const inspections = state.snapshot.inspections
    .filter((inspection) => inspection.machineId === machine.id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-8);

  if (inspections.length < 2) {
    return "<p class='empty-state'>Add two inspections to draw a trend.</p>";
  }

  const width = 760;
  const height = 300;
  const left = 54;
  const right = 28;
  const top = 24;
  const bottom = 46;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const tempMax = Math.max(machine.limits.temperatureC, ...inspections.map((item) => item.temperatureC));
  const vibrationMax = Math.max(machine.limits.vibrationMmS, ...inspections.map((item) => item.vibrationMmS));

  const x = (index) => left + (plotWidth * index) / Math.max(1, inspections.length - 1);
  const yTemp = (value) => top + plotHeight - (value / tempMax) * plotHeight;
  const yVibration = (value) => top + plotHeight - (value / vibrationMax) * plotHeight;
  const pathFor = (field, yScale) =>
    inspections.map((item, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yScale(item[field])}`).join(" ");
  const tempPath = pathFor("temperatureC", yTemp);
  const vibrationPath = pathFor("vibrationMmS", yVibration);
  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const yValue = top + plotHeight * ratio;
      return `<line x1="${left}" y1="${yValue}" x2="${width - right}" y2="${yValue}" class="grid-line" />`;
    })
    .join("");
  const points = inspections
    .map(
      (item, index) => `
        <circle cx="${x(index)}" cy="${yTemp(item.temperatureC)}" r="4" class="temp-point">
          <title>${formatDate(item.timestamp)} temp ${item.temperatureC} C</title>
        </circle>
        <circle cx="${x(index)}" cy="${yVibration(item.vibrationMmS)}" r="4" class="vibration-point">
          <title>${formatDate(item.timestamp)} vibration ${item.vibrationMmS} mm/s</title>
        </circle>
      `
    )
    .join("");
  const xLabels = inspections
    .map((item, index) => `<text x="${x(index)}" y="${height - 16}" text-anchor="middle">${formatShortDate(item.timestamp)}</text>`)
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(machine.name)} temperature and vibration trend">
      <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" class="plot-bg" />
      ${grid}
      <line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" class="axis" />
      <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" class="axis" />
      <path d="${tempPath}" class="temp-line" />
      <path d="${vibrationPath}" class="vibration-line" />
      ${points}
      ${xLabels}
      <text x="${left}" y="18" class="axis-title">Temperature C</text>
      <text x="${width - right}" y="18" text-anchor="end" class="axis-title">Vibration mm/s</text>
      <g class="legend">
        <rect x="${left}" y="${height - 38}" width="10" height="10" class="temp-swatch" />
        <text x="${left + 16}" y="${height - 29}">Temperature</text>
        <rect x="${left + 124}" y="${height - 38}" width="10" height="10" class="vibration-swatch" />
        <text x="${left + 140}" y="${height - 29}">Vibration</text>
      </g>
    </svg>
  `;
}

function renderInspections() {
  ui.recentInspections.innerHTML = state.snapshot.recentInspections
    .map((inspection) => {
      const machine = state.snapshot.machines.find((item) => item.id === inspection.machineId);
      return `
        <tr>
          <td>${formatDateTime(inspection.timestamp)}</td>
          <td>${escapeHtml(machine?.name ?? inspection.machineId)}</td>
          <td>${inspection.temperatureC} C</td>
          <td>${inspection.vibrationMmS} mm/s</td>
          <td>${inspection.oilQuality}</td>
          <td>${escapeHtml(inspection.operator)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderKnowledge() {
  ui.knowledgeEntries.innerHTML = state.snapshot.knowledgeEntries
    .slice(0, 8)
    .map((entry) => {
      const machine = state.snapshot.machines.find((item) => item.id === entry.machineId);
      return `
        <article class="compact-card">
          <strong>${escapeHtml(entry.title)}</strong>
          <span>${escapeHtml(entry.supervisor)} - ${escapeHtml(entry.language)}</span>
          <p>${escapeHtml(entry.content)}</p>
          <small>${escapeHtml(machine?.name ?? "Factory-wide")} - ${formatDate(entry.createdAt)}</small>
        </article>
      `;
    })
    .join("");

  ui.sopEntries.innerHTML = state.snapshot.sops
    .slice(0, 8)
    .map(
      (sop) => `
        <article class="compact-card">
          <strong>${escapeHtml(sop.title)}</strong>
          <ol>${sop.checklist.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </article>
      `
    )
    .join("");
}

function renderWorkforce() {
  ui.workerList.innerHTML = state.snapshot.workers
    .map(
      (worker) => `
        <label class="worker-card">
          <input type="checkbox" data-worker-id="${worker.id}" ${worker.absent ? "checked" : ""} />
          <span>
            <strong>${escapeHtml(worker.name)}</strong>
            <small>${escapeHtml(worker.skills.join(", "))} - ${worker.shift}</small>
          </span>
          <em>${worker.absent ? "Absent" : "Available"}</em>
        </label>
      `
    )
    .join("");

  ui.workerList.querySelectorAll("[data-worker-id]").forEach((input) => {
    input.addEventListener("change", async () => {
      const result = await postJson("/api/workforce/absence", {
        workerId: input.dataset.workerId,
        absent: input.checked
      });
      state.snapshot = result.snapshot;
      renderWorkforce();
    });
  });

  ui.assignmentRows.innerHTML = state.snapshot.assignments
    .map(
      (assignment) => `
        <tr>
          <td>${escapeHtml(assignment.machineName)}</td>
          <td><span class="risk-pill ${assignment.riskLevel}">${assignment.riskLevel}</span></td>
          <td>${escapeHtml(assignment.workerName)}</td>
          <td>${assignment.confidence}%</td>
          <td>${escapeHtml(assignment.reason)}</td>
        </tr>
      `
    )
    .join("");
}

function renderAlerts() {
  ui.alertsList.innerHTML = state.snapshot.alerts.length
    ? state.snapshot.alerts
        .map(
          (alert) => `
            <article class="alert-item ${alert.severity}" data-alert-machine="${alert.machineId}">
              <strong>${escapeHtml(alert.title)}</strong>
              <p>${escapeHtml(alert.message)}</p>
            </article>
          `
        )
        .join("")
    : "<p class='empty-state'>No critical alerts. Keep logging inspections.</p>";

  ui.alertsList.querySelectorAll("[data-alert-machine]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedMachineId = item.dataset.alertMachine;
      render();
    });
  });
}

async function askCopilot(question) {
  ui.copilotAnswer.innerHTML = "<p>Thinking through latest maintenance data...</p>";
  const result = await postJson("/api/copilot", { question });
  ui.copilotAnswer.innerHTML = `
    <strong>${escapeHtml(result.answer)}</strong>
    ${
      result.sources?.length
        ? `<ul>${result.sources.map((source) => `<li>${escapeHtml(source)}</li>`).join("")}</ul>`
        : ""
    }
  `;
}

function getSelectedMachine() {
  return state.snapshot?.machines.find((machine) => machine.id === state.selectedMachineId) ?? null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "numeric",
    day: "numeric"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
