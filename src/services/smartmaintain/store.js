import fs from "node:fs";
import path from "node:path";
import {
  analyzeMachine,
  buildAlerts,
  buildWorkforceAssignments,
  summarizeFleet
} from "./analytics.js";

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function ensureNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sortNewestFirst(items) {
  return [...items].sort((a, b) => new Date(b.timestamp ?? b.createdAt) - new Date(a.timestamp ?? a.createdAt));
}

export class SmartMaintainStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
  }

  init() {
    if (fs.existsSync(this.filePath)) {
      this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      return;
    }

    this.data = createSeedData();
    this.save();
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, "utf8");
  }

  getSnapshot() {
    const analyses = this.data.machines.map((machine) =>
      analyzeMachine(
        machine,
        this.data.inspections.filter((inspection) => inspection.machineId === machine.id),
        this.data.workOrders
      )
    );

    const machines = this.data.machines.map((machine) => ({
      ...machine,
      analysis: analyses.find((analysis) => analysis.machineId === machine.id)
    }));

    return {
      generatedAt: new Date().toISOString(),
      factory: this.data.factory,
      summary: summarizeFleet(analyses, this.data.workOrders),
      machines,
      inspections: sortNewestFirst(this.data.inspections),
      recentInspections: sortNewestFirst(this.data.inspections).slice(0, 18),
      workers: this.data.workers,
      assignments: buildWorkforceAssignments(this.data, analyses),
      workOrders: sortNewestFirst(this.data.workOrders),
      alerts: buildAlerts(this.data.machines, analyses, this.data.workOrders),
      knowledgeEntries: sortNewestFirst(this.data.knowledgeEntries),
      sops: sortNewestFirst(this.data.sops)
    };
  }

  addInspection(input) {
    const machine = this.findMachine(input.machineId);
    const latest = sortNewestFirst(
      this.data.inspections.filter((inspection) => inspection.machineId === machine.id)
    )[0];

    const inspection = {
      id: createId("inspection"),
      machineId: machine.id,
      operator: String(input.operator ?? "Shop floor operator").trim() || "Shop floor operator",
      timestamp: new Date().toISOString(),
      temperatureC: ensureNumber(input.temperatureC, latest?.temperatureC ?? machine.normal.temperatureC),
      vibrationMmS: ensureNumber(input.vibrationMmS, latest?.vibrationMmS ?? machine.normal.vibrationMmS),
      noiseDb: ensureNumber(input.noiseDb, latest?.noiseDb ?? machine.normal.noiseDb),
      oilQuality: ensureNumber(input.oilQuality, latest?.oilQuality ?? machine.normal.oilQuality),
      powerKw: ensureNumber(input.powerKw, latest?.powerKw ?? machine.normal.powerKw),
      note: String(input.note ?? "").trim()
    };

    this.data.inspections.push(inspection);
    machine.hoursSinceService += ensureNumber(input.operatingHours, 8);
    machine.runningHours += ensureNumber(input.operatingHours, 8);
    this.save();
    return inspection;
  }

  addKnowledgeEntry(input) {
    const machine = input.machineId ? this.findMachine(input.machineId) : null;
    const entry = {
      id: createId("knowledge"),
      machineId: machine?.id ?? null,
      title: String(input.title ?? "Supervisor note").trim() || "Supervisor note",
      supervisor: String(input.supervisor ?? "Senior supervisor").trim() || "Senior supervisor",
      language: String(input.language ?? "English").trim() || "English",
      tags: String(input.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      content: String(input.content ?? "").trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.content) {
      throw new Error("Knowledge content is required.");
    }

    this.data.knowledgeEntries.push(entry);
    const sop = this.generateSopFromEntry(entry);
    this.save();
    return { entry, sop };
  }

  generateSopFromEntry(entry) {
    const machine = entry.machineId ? this.findMachine(entry.machineId) : null;
    const title = `SOP: ${entry.title}`;
    const content = [
      `Scope: ${machine ? machine.name : "Factory process"} - ${entry.title}`,
      "1. Check current machine health, open work orders, and latest inspection reading.",
      "2. Ask the assigned operator to repeat the supervisor observation before starting work.",
      `3. Apply the captured instruction: ${entry.content}`,
      "4. Record temperature, vibration, noise, oil quality, and power draw after the action.",
      "5. Escalate to maintenance lead if the risk level remains critical after one shift."
    ];
    const sop = {
      id: createId("sop"),
      knowledgeEntryId: entry.id,
      machineId: entry.machineId,
      title,
      checklist: content,
      createdAt: new Date().toISOString()
    };
    this.data.sops.push(sop);
    return sop;
  }

  createWorkOrder(input) {
    const machine = this.findMachine(input.machineId);
    const order = {
      id: createId("wo"),
      machineId: machine.id,
      title: String(input.title ?? `Inspect ${machine.name}`).trim(),
      priority: String(input.priority ?? "high").trim(),
      status: "open",
      owner: String(input.owner ?? "Maintenance lead").trim(),
      createdAt: new Date().toISOString()
    };
    this.data.workOrders.push(order);
    this.save();
    return order;
  }

  updateWorkerAbsence(workerId, absent) {
    const worker = this.data.workers.find((item) => item.id === workerId);
    if (!worker) {
      throw new Error("Worker not found.");
    }
    worker.absent = Boolean(absent);
    this.save();
    return worker;
  }

  answerCopilot(question) {
    const snapshot = this.getSnapshot();
    const normalized = String(question ?? "").toLowerCase();
    const riskyMachines = snapshot.machines
      .filter((machine) => machine.analysis.riskLevel !== "stable")
      .sort((a, b) => a.analysis.healthScore - b.analysis.healthScore);
    const mostRisky = riskyMachines[0] ?? snapshot.machines.sort((a, b) => a.analysis.healthScore - b.analysis.healthScore)[0];

    if (!question || !String(question).trim()) {
      return {
        answer: "Ask about machine risk, maintenance priority, workforce assignment, SOPs, or latest inspection trends.",
        sources: []
      };
    }

    if (normalized.includes("which") && normalized.includes("maintenance")) {
      return {
        answer: `${mostRisky.name} should be handled first. Health is ${mostRisky.analysis.healthScore}/100 and ${mostRisky.analysis.predictions[0].component} risk is ${mostRisky.analysis.predictions[0].probabilityPercent}% ${mostRisky.analysis.predictions[0].timeframe}.`,
        sources: mostRisky.analysis.explainability
      };
    }

    if (normalized.includes("why") || normalized.includes("explain")) {
      return {
        answer: `${mostRisky.name} is flagged because ${mostRisky.analysis.explainability.join(" ")}`,
        sources: [mostRisky.analysis.recommendation]
      };
    }

    if (normalized.includes("worker") || normalized.includes("assign")) {
      const assignment = snapshot.assignments.find((item) => item.machineId === mostRisky.id) ?? snapshot.assignments[0];
      return {
        answer: `${assignment.workerName} is assigned to ${assignment.machineName}. Confidence is ${assignment.confidence}% because ${assignment.reason}`,
        sources: snapshot.assignments.slice(0, 4).map((item) => `${item.machineName}: ${item.workerName}`)
      };
    }

    if (normalized.includes("sop") || normalized.includes("knowledge")) {
      const sop = snapshot.sops[0];
      return {
        answer: sop
          ? `${sop.title} is ready with ${sop.checklist.length} checklist steps. It is based on captured supervisor knowledge.`
          : "No SOP is stored yet. Capture one supervisor note and I will convert it into a checklist.",
        sources: sop?.checklist ?? []
      };
    }

    return {
      answer: `Factory health is ${snapshot.summary.averageHealth}/100. There are ${snapshot.summary.criticalMachines} critical machines, ${snapshot.summary.watchMachines} watch machines, and ${snapshot.summary.openWorkOrders} open work orders. The next best action is: ${mostRisky.analysis.recommendation}`,
      sources: mostRisky.analysis.explainability
    };
  }

  findMachine(machineId) {
    const machine = this.data.machines.find((item) => item.id === machineId);
    if (!machine) {
      throw new Error("Machine not found.");
    }
    return machine;
  }
}

function createSeedData() {
  return {
    factory: {
      name: "SmartMaintain AI Demo Factory",
      location: "Coimbatore MSME cluster",
      sector: "Engineering, machinery, and automation",
      shift: "A shift",
      plan: "Professional",
      objective: "Predict failures from manual inspection data without mandatory IoT sensors."
    },
    machines: [
      createMachine({
        id: "cnc-01",
        name: "CNC Lathe 01",
        cell: "Machining",
        type: "CNC lathe",
        requiredSkill: "cnc",
        runningHours: 12840,
        hoursSinceService: 610,
        serviceIntervalHours: 720,
        normal: { temperatureC: 58, vibrationMmS: 2.8, noiseDb: 76, oilQuality: 84, powerKw: 13 },
        limits: { temperatureC: 78, vibrationMmS: 6.5, noiseDb: 92, oilQuality: 45, powerKw: 22 }
      }),
      createMachine({
        id: "press-02",
        name: "Hydraulic Press 02",
        cell: "Press shop",
        type: "Hydraulic press",
        requiredSkill: "press",
        runningHours: 20210,
        hoursSinceService: 780,
        serviceIntervalHours: 900,
        normal: { temperatureC: 61, vibrationMmS: 3.6, noiseDb: 82, oilQuality: 82, powerKw: 19 },
        limits: { temperatureC: 82, vibrationMmS: 7.2, noiseDb: 96, oilQuality: 42, powerKw: 31 }
      }),
      createMachine({
        id: "compressor-01",
        name: "Air Compressor 01",
        cell: "Utilities",
        type: "Rotary compressor",
        requiredSkill: "utilities",
        runningHours: 16640,
        hoursSinceService: 430,
        serviceIntervalHours: 650,
        normal: { temperatureC: 69, vibrationMmS: 3.2, noiseDb: 79, oilQuality: 86, powerKw: 24 },
        limits: { temperatureC: 92, vibrationMmS: 6.8, noiseDb: 95, oilQuality: 48, powerKw: 36 }
      }),
      createMachine({
        id: "molder-03",
        name: "Injection Molder 03",
        cell: "Plastics",
        type: "Injection molding",
        requiredSkill: "molding",
        runningHours: 9750,
        hoursSinceService: 260,
        serviceIntervalHours: 800,
        normal: { temperatureC: 72, vibrationMmS: 2.9, noiseDb: 74, oilQuality: 88, powerKw: 21 },
        limits: { temperatureC: 96, vibrationMmS: 6.2, noiseDb: 91, oilQuality: 46, powerKw: 34 }
      }),
      createMachine({
        id: "conveyor-02",
        name: "Packaging Conveyor 02",
        cell: "Packing",
        type: "Conveyor",
        requiredSkill: "packing",
        runningHours: 7420,
        hoursSinceService: 510,
        serviceIntervalHours: 700,
        normal: { temperatureC: 45, vibrationMmS: 2.1, noiseDb: 70, oilQuality: 90, powerKw: 8 },
        limits: { temperatureC: 65, vibrationMmS: 5.8, noiseDb: 88, oilQuality: 50, powerKw: 14 }
      }),
      createMachine({
        id: "dye-01",
        name: "Textile Dye Bath 01",
        cell: "Textiles",
        type: "Dyeing machine",
        requiredSkill: "textile",
        runningHours: 11890,
        hoursSinceService: 340,
        serviceIntervalHours: 780,
        normal: { temperatureC: 82, vibrationMmS: 2.4, noiseDb: 72, oilQuality: 87, powerKw: 16 },
        limits: { temperatureC: 101, vibrationMmS: 5.5, noiseDb: 87, oilQuality: 47, powerKw: 27 }
      })
    ],
    inspections: [
      ...series("cnc-01", [
        ["2026-07-12T08:00:00.000Z", 60, 3.1, 77, 82, 14],
        ["2026-07-13T08:00:00.000Z", 62, 3.6, 79, 78, 15],
        ["2026-07-14T08:00:00.000Z", 64, 4.4, 81, 74, 16],
        ["2026-07-15T08:00:00.000Z", 68, 5.4, 84, 69, 17],
        ["2026-07-16T08:00:00.000Z", 71, 6.1, 86, 65, 18],
        ["2026-07-17T08:00:00.000Z", 73, 6.4, 87, 61, 19]
      ]),
      ...series("press-02", [
        ["2026-07-12T08:10:00.000Z", 63, 3.9, 83, 79, 20],
        ["2026-07-13T08:10:00.000Z", 65, 4.3, 84, 75, 21],
        ["2026-07-14T08:10:00.000Z", 67, 4.9, 86, 71, 22],
        ["2026-07-15T08:10:00.000Z", 68, 5.1, 87, 69, 23],
        ["2026-07-16T08:10:00.000Z", 70, 5.8, 89, 64, 24],
        ["2026-07-17T08:10:00.000Z", 72, 6.2, 91, 60, 25]
      ]),
      ...series("compressor-01", [
        ["2026-07-12T08:20:00.000Z", 69, 3.1, 78, 86, 24],
        ["2026-07-13T08:20:00.000Z", 70, 3.3, 80, 84, 25],
        ["2026-07-14T08:20:00.000Z", 71, 3.5, 80, 83, 25],
        ["2026-07-15T08:20:00.000Z", 73, 3.8, 82, 82, 26],
        ["2026-07-16T08:20:00.000Z", 75, 4.2, 83, 80, 27],
        ["2026-07-17T08:20:00.000Z", 77, 4.4, 84, 79, 27]
      ]),
      ...series("molder-03", [
        ["2026-07-12T08:30:00.000Z", 72, 2.8, 73, 88, 21],
        ["2026-07-13T08:30:00.000Z", 73, 2.9, 74, 88, 21],
        ["2026-07-14T08:30:00.000Z", 74, 3.0, 74, 87, 22],
        ["2026-07-15T08:30:00.000Z", 75, 3.1, 75, 87, 22],
        ["2026-07-16T08:30:00.000Z", 75, 3.1, 75, 86, 22],
        ["2026-07-17T08:30:00.000Z", 76, 3.2, 76, 86, 22]
      ]),
      ...series("conveyor-02", [
        ["2026-07-12T08:40:00.000Z", 45, 2.2, 70, 90, 8],
        ["2026-07-13T08:40:00.000Z", 46, 2.3, 71, 89, 8],
        ["2026-07-14T08:40:00.000Z", 47, 2.5, 72, 88, 8],
        ["2026-07-15T08:40:00.000Z", 48, 2.8, 74, 86, 9],
        ["2026-07-16T08:40:00.000Z", 51, 3.4, 77, 83, 9],
        ["2026-07-17T08:40:00.000Z", 54, 4.1, 80, 80, 10]
      ]),
      ...series("dye-01", [
        ["2026-07-12T08:50:00.000Z", 82, 2.4, 72, 87, 16],
        ["2026-07-13T08:50:00.000Z", 83, 2.5, 72, 87, 16],
        ["2026-07-14T08:50:00.000Z", 83, 2.5, 73, 86, 16],
        ["2026-07-15T08:50:00.000Z", 84, 2.6, 73, 86, 17],
        ["2026-07-16T08:50:00.000Z", 84, 2.7, 74, 85, 17],
        ["2026-07-17T08:50:00.000Z", 85, 2.7, 74, 85, 17]
      ])
    ],
    workers: [
      createWorker("worker-01", "Anita Rao", ["cnc", "maintenance"], "A shift", 94),
      createWorker("worker-02", "Karthik M", ["press", "maintenance"], "A shift", 91),
      createWorker("worker-03", "Selvam P", ["utilities", "packing"], "A shift", 86),
      createWorker("worker-04", "Meena S", ["molding", "quality"], "A shift", 88),
      createWorker("worker-05", "Rafiq K", ["textile", "packing"], "A shift", 89),
      createWorker("worker-06", "Priya N", ["cnc", "quality"], "B shift", 84)
    ],
    workOrders: [
      {
        id: "wo-1001",
        machineId: "cnc-01",
        title: "Inspect spindle bearing vibration and oil condition",
        priority: "critical",
        status: "open",
        owner: "Maintenance lead",
        createdAt: "2026-07-17T09:15:00.000Z"
      },
      {
        id: "wo-1002",
        machineId: "conveyor-02",
        title: "Check belt alignment after packing shift",
        priority: "high",
        status: "open",
        owner: "Packing supervisor",
        createdAt: "2026-07-16T14:20:00.000Z"
      }
    ],
    knowledgeEntries: [
      {
        id: "knowledge-1001",
        machineId: "dye-01",
        title: "Monsoon dye bath adjustment",
        supervisor: "R. Subramanian",
        language: "Tamil",
        tags: ["monsoon", "dyeing", "quality"],
        content:
          "When humidity is high, keep the dye bath running 12 minutes longer and verify shade before unloading.",
        createdAt: "2026-07-15T11:00:00.000Z"
      },
      {
        id: "knowledge-1002",
        machineId: "press-02",
        title: "Hydraulic press warm startup",
        supervisor: "A. Joseph",
        language: "English",
        tags: ["press", "startup", "hydraulic"],
        content:
          "If press noise rises after lunch break, run two low-load cycles and check oil temperature before full stroke.",
        createdAt: "2026-07-16T10:30:00.000Z"
      }
    ],
    sops: [
      {
        id: "sop-1001",
        knowledgeEntryId: "knowledge-1002",
        machineId: "press-02",
        title: "SOP: Hydraulic press warm startup",
        checklist: [
          "Scope: Hydraulic Press 02 - warm startup after idle period",
          "1. Confirm guards, oil level, and last inspection values.",
          "2. Run two low-load cycles before full production stroke.",
          "3. Check oil temperature, noise, and vibration after warmup.",
          "4. Escalate if noise remains above normal after warmup."
        ],
        createdAt: "2026-07-16T10:35:00.000Z"
      }
    ]
  };
}

function createMachine(input) {
  return {
    ...input,
    defaultReading: {
      timestamp: "2026-07-17T08:00:00.000Z",
      ...input.normal
    }
  };
}

function createWorker(id, name, skills, shift, reliabilityScore) {
  return {
    id,
    name,
    skills,
    shift,
    reliabilityScore,
    available: true,
    absent: false
  };
}

function series(machineId, rows) {
  return rows.map(([timestamp, temperatureC, vibrationMmS, noiseDb, oilQuality, powerKw], index) => ({
    id: `${machineId}-reading-${index + 1}`,
    machineId,
    operator: index % 2 === 0 ? "Operator A" : "Operator B",
    timestamp,
    temperatureC,
    vibrationMmS,
    noiseDb,
    oilQuality,
    powerKw,
    note: index === rows.length - 1 ? "Morning manual inspection" : ""
  }));
}
