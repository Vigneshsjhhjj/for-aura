import { randomUUID } from "node:crypto";
import path from "node:path";
import { ensureDir, readJson, writeJson } from "../../utils/jsonFile.js";

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export class LocalDatabase {
  constructor(filePath, config) {
    this.filePath = filePath;
    this.config = config;
    this.data = null;
  }

  init() {
    ensureDir(path.dirname(this.filePath));
    const fallback = {
      meta: {
        version: 1,
        assistantName: this.config.assistantName,
        ownerName: this.config.ownerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      preferences: {
        inputLanguage: this.config.modes.defaultInputLanguage,
        replyLanguage: this.config.modes.defaultReplyLanguage,
        alwaysListen: this.config.modes.alwaysListen,
        voiceEnabled: true,
        allowDangerousSystemActions: this.config.modes.allowDangerousSystemActions,
        allowBrowserAutomation: this.config.modes.allowBrowserAutomation
      },
      profile: {
        identity: {
          preferredName: "",
          aliases: [],
          facts: {}
        },
        voiceProfiles: [],
        activeVoiceProfileId: null,
        languagesUsed: [],
        favoriteApps: [],
        favoriteWebsites: [],
        conversationStyle: "friendly",
        lastKnownMood: "supportive"
      },
      memories: [],
      events: [],
      routines: [],
      tasks: [],
      accessRequests: [],
      approvedDevices: []
    };
    this.data = this.normalizeData(readJson(this.filePath, fallback), fallback);
    this.data.meta.assistantName = this.config.assistantName;
    this.data.meta.ownerName = this.config.ownerName;
    this.persist();
  }

  normalizeData(raw, fallback) {
    const normalized = {
      ...fallback,
      ...raw,
      meta: {
        ...fallback.meta,
        ...(raw.meta ?? {})
      },
      preferences: {
        ...fallback.preferences,
        ...(raw.preferences ?? {})
      },
      profile: {
        ...fallback.profile,
        ...(raw.profile ?? {}),
        identity: {
          ...fallback.profile.identity,
          ...(raw.profile?.identity ?? {})
        },
        voiceProfiles: Array.isArray(raw.profile?.voiceProfiles)
          ? raw.profile.voiceProfiles
          : [],
        activeVoiceProfileId: raw.profile?.activeVoiceProfileId ?? null
      },
      memories: Array.isArray(raw.memories) ? raw.memories : [],
      events: Array.isArray(raw.events) ? raw.events : [],
      routines: Array.isArray(raw.routines) ? raw.routines : [],
      tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
      accessRequests: Array.isArray(raw.accessRequests) ? raw.accessRequests : [],
      approvedDevices: Array.isArray(raw.approvedDevices) ? raw.approvedDevices : []
    };

    if (
      normalized.profile.identity.preferredName &&
      !normalized.profile.identity.facts.preferredName
    ) {
      normalized.profile.identity.facts.preferredName = {
        key: "preferredName",
        value: normalized.profile.identity.preferredName,
        sourceText: "migration",
        updatedAt: new Date().toISOString()
      };
    }

    return normalized;
  }

  persist() {
    this.data.meta.updatedAt = new Date().toISOString();
    writeJson(this.filePath, this.data);
  }

  getSnapshot() {
    return structuredClone(this.data);
  }

  getPreferences() {
    return structuredClone(this.data.preferences);
  }

  getProfile() {
    return structuredClone(this.data.profile);
  }

  updatePreferences(patch) {
    this.data.preferences = {
      ...this.data.preferences,
      ...patch
    };
    this.persist();
    return this.getPreferences();
  }

  updateProfile(mutator) {
    this.data.profile = mutator(structuredClone(this.data.profile));
    this.persist();
    return structuredClone(this.data.profile);
  }

  upsertProfileFact(factKey, value, sourceText = "") {
    const now = new Date().toISOString();
    const current = this.data.profile.identity.facts[factKey];
    this.data.profile.identity.facts[factKey] = {
      key: factKey,
      value,
      sourceText,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };

    if (factKey === "preferredName") {
      this.data.profile.identity.preferredName = value;
      if (!this.data.profile.identity.aliases.includes(value)) {
        this.data.profile.identity.aliases.push(value);
      }
    }

    this.persist();
    return structuredClone(this.data.profile.identity.facts[factKey]);
  }

  getProfileFact(factKey) {
    return structuredClone(this.data.profile.identity.facts[factKey] ?? null);
  }

  addVoiceProfile(voiceProfile) {
    const record = {
      id: randomUUID(),
      label: voiceProfile.label ?? "Custom Voice",
      fileName: voiceProfile.fileName,
      relativePath: voiceProfile.relativePath,
      mimeType: voiceProfile.mimeType ?? "audio/webm",
      sizeBytes: voiceProfile.sizeBytes ?? 0,
      createdAt: new Date().toISOString()
    };

    this.data.profile.voiceProfiles.unshift(record);
    this.data.profile.activeVoiceProfileId = record.id;
    this.persist();
    return structuredClone(record);
  }

  getVoiceProfiles() {
    return {
      activeVoiceProfileId: this.data.profile.activeVoiceProfileId,
      items: structuredClone(this.data.profile.voiceProfiles)
    };
  }

  createAccessRequest({ deviceName, userName, reason, requesterIp }) {
    const now = new Date().toISOString();
    const existingPending = this.data.accessRequests.find(
      (request) =>
        request.status === "pending" &&
        request.deviceName.toLowerCase() === deviceName.toLowerCase()
    );

    if (existingPending) {
      existingPending.userName = userName;
      existingPending.reason = reason;
      existingPending.requesterIp = requesterIp;
      existingPending.updatedAt = now;
      this.persist();
      return structuredClone(existingPending);
    }

    const record = {
      id: randomUUID(),
      deviceName,
      userName,
      reason,
      requesterIp,
      status: "pending",
      requestedAt: now,
      updatedAt: now,
      approvedAt: null,
      approvedDeviceId: null
    };

    this.data.accessRequests.unshift(record);
    this.data.accessRequests = this.data.accessRequests.slice(0, 100);
    this.persist();
    return structuredClone(record);
  }

  getAccessControlSnapshot() {
    return {
      requests: structuredClone(this.data.accessRequests),
      approvedDevices: structuredClone(this.data.approvedDevices).map((device) => ({
        ...device,
        tokenPreview: this.previewToken(device.token),
        token: undefined
      }))
    };
  }

  approveAccessRequest(requestId) {
    const request = this.data.accessRequests.find((item) => item.id === requestId);
    if (!request) {
      return null;
    }

    const now = new Date().toISOString();
    const token = `aura_mobile_${randomUUID().replaceAll("-", "")}`;
    const device = {
      id: randomUUID(),
      requestId: request.id,
      deviceName: request.deviceName,
      userName: request.userName,
      requesterIp: request.requesterIp,
      role: "mobile-user",
      token,
      createdAt: now,
      lastUsedAt: null,
      revokedAt: null
    };

    request.status = "approved";
    request.approvedAt = now;
    request.updatedAt = now;
    request.approvedDeviceId = device.id;
    this.data.approvedDevices.unshift(device);
    this.persist();

    return {
      request: structuredClone(request),
      device: {
        ...structuredClone(device),
        tokenPreview: this.previewToken(token)
      }
    };
  }

  revokeApprovedDevice(deviceId) {
    const device = this.data.approvedDevices.find((item) => item.id === deviceId);
    if (!device) {
      return null;
    }

    device.revokedAt = new Date().toISOString();
    this.persist();
    return {
      ...structuredClone(device),
      tokenPreview: this.previewToken(device.token),
      token: undefined
    };
  }

  verifyMobileToken(token) {
    const normalizedToken = String(token ?? "").trim();
    if (!normalizedToken) {
      return null;
    }

    const device = this.data.approvedDevices.find(
      (item) => item.token === normalizedToken && !item.revokedAt
    );

    if (!device) {
      return null;
    }

    device.lastUsedAt = new Date().toISOString();
    this.persist();
    return structuredClone(device);
  }

  previewToken(token) {
    const value = String(token ?? "");
    if (value.length <= 10) {
      return value;
    }
    return `${value.slice(0, 14)}...${value.slice(-6)}`;
  }

  addTask(title, sourceText = "") {
    const record = {
      id: randomUUID(),
      title: title.trim(),
      status: "pending",
      sourceText,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    this.data.tasks.unshift(record);
    this.persist();
    return structuredClone(record);
  }

  getTasks() {
    return structuredClone(this.data.tasks);
  }

  completeTaskByMatcher(matcher) {
    const normalizedMatcher = String(matcher).trim().toLowerCase();
    const task =
      this.data.tasks.find((item) => item.id === matcher) ??
      this.data.tasks.find(
        (item) =>
          item.status !== "completed" &&
          item.title.toLowerCase().includes(normalizedMatcher)
      );

    if (!task) {
      return null;
    }

    task.status = "completed";
    task.completedAt = new Date().toISOString();
    this.persist();
    return structuredClone(task);
  }

  setActiveVoiceProfile(voiceProfileId) {
    const match = this.data.profile.voiceProfiles.find((voice) => voice.id === voiceProfileId);
    if (!match) {
      return null;
    }

    this.data.profile.activeVoiceProfileId = voiceProfileId;
    this.persist();
    return structuredClone(match);
  }

  addMemory(memory) {
    const record = {
      id: randomUUID(),
      kind: memory.kind ?? "conversation",
      text: memory.text ?? "",
      language: memory.language ?? this.data.preferences.replyLanguage,
      tags: memory.tags ?? [],
      importance: memory.importance ?? 1,
      metadata: memory.metadata ?? {},
      createdAt: new Date().toISOString()
    };

    this.data.memories.unshift(record);
    this.data.memories = this.data.memories.slice(0, 400);
    this.persist();
    return record;
  }

  addEvent(event) {
    const record = {
      id: randomUUID(),
      type: event.type ?? "system",
      text: event.text ?? "",
      success: event.success ?? true,
      latencyMs: event.latencyMs ?? 0,
      metadata: event.metadata ?? {},
      createdAt: new Date().toISOString()
    };

    this.data.events.unshift(record);
    this.data.events = this.data.events.slice(0, 1200);
    this.persist();
    return record;
  }

  recordRoutine(actionName, triggerText) {
    const existing = this.data.routines.find((routine) => routine.actionName === actionName);
    if (existing) {
      existing.frequency += 1;
      existing.lastUsedAt = new Date().toISOString();
      existing.lastTriggerText = triggerText;
    } else {
      this.data.routines.push({
        id: randomUUID(),
        actionName,
        frequency: 1,
        lastUsedAt: new Date().toISOString(),
        lastTriggerText: triggerText
      });
    }
    this.persist();
  }

  searchMemories(query, limit = 6) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    return this.data.memories
      .map((memory) => {
        const memoryTokens = tokenize(`${memory.text} ${memory.tags.join(" ")}`);
        const overlap = queryTokens.filter((token) => memoryTokens.includes(token)).length;
        const recencyBoost = Math.max(0, 10 - this.minutesAgo(memory.createdAt) / 144);
        const score = overlap * 4 + recencyBoost + memory.importance;
        return { ...memory, score };
      })
      .filter((memory) => memory.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);
  }

  getRecentEvents(limit = 25) {
    return structuredClone(this.data.events.slice(0, limit));
  }

  getLearningSummary() {
    const actionCounts = new Map();
    const languageCounts = new Map();

    for (const event of this.data.events) {
      const actionName = event.metadata?.actionName;
      const language = event.metadata?.language;

      if (actionName) {
        actionCounts.set(actionName, (actionCounts.get(actionName) ?? 0) + 1);
      }

      if (language) {
        languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
      }
    }

    return {
      profile: structuredClone(this.data.profile),
      facts: Object.values(this.data.profile.identity.facts).sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt)
      ),
      activeVoiceProfile:
        this.data.profile.voiceProfiles.find(
          (voice) => voice.id === this.data.profile.activeVoiceProfileId
        ) ?? null,
      topActions: [...actionCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([actionName, count]) => ({ actionName, count })),
      topLanguages: [...languageCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([language, count]) => ({ language, count })),
      routines: structuredClone(
        [...this.data.routines].sort((left, right) => right.frequency - left.frequency).slice(0, 8)
      ),
      tasks: structuredClone(this.data.tasks.slice(0, 20))
    };
  }

  minutesAgo(isoDate) {
    return Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  }
}
