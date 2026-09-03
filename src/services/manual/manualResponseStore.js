import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "../../utils/jsonFile.js";

function normalize(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, " ");
}

function renderTemplate(template, context) {
  return String(template)
    .replaceAll("{assistantName}", context.assistantName)
    .replaceAll("{ownerName}", context.ownerName)
    .replaceAll("{addressUserAs}", context.addressUserAs);
}

export class ManualResponseStore {
  constructor(filePath, contextGetter) {
    this.filePath = filePath;
    this.contextGetter = contextGetter;
  }

  getRules() {
    return readJson(this.filePath, []);
  }

  upsertRule(rule) {
    const rules = this.getRules();
    const normalizedRule = {
      id: rule.id || randomUUID(),
      match: rule.match === "includes" ? "includes" : "exact",
      triggers: Array.isArray(rule.triggers)
        ? rule.triggers.map((trigger) => String(trigger).trim()).filter(Boolean)
        : [],
      response: String(rule.response ?? "").trim()
    };

    if (normalizedRule.triggers.length === 0 || !normalizedRule.response) {
      throw new Error("A manual response needs at least one trigger and one response.");
    }

    const existingIndex = rules.findIndex((item) => item.id === normalizedRule.id);
    if (existingIndex >= 0) {
      rules[existingIndex] = normalizedRule;
    } else {
      rules.unshift(normalizedRule);
    }

    writeJson(this.filePath, rules);
    return normalizedRule;
  }

  deleteRule(ruleId) {
    const rules = this.getRules();
    const nextRules = rules.filter((rule) => rule.id !== ruleId);
    writeJson(this.filePath, nextRules);
    return nextRules.length !== rules.length;
  }

  findMatch(text) {
    const normalizedInput = normalize(text);
    const rules = this.getRules();

    for (const rule of rules) {
      const triggers = Array.isArray(rule.triggers) ? rule.triggers.map(normalize) : [];
      const matchMode = rule.match === "includes" ? "includes" : "exact";
      const matched = triggers.some((trigger) =>
        matchMode === "includes"
          ? normalizedInput.includes(trigger)
          : normalizedInput === trigger
      );

      if (matched && rule.response) {
        return {
          id: rule.id ?? "manual-response",
          replyText: renderTemplate(rule.response, this.contextGetter())
        };
      }
    }

    return null;
  }
}
