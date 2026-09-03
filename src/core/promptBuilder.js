import { ENGINE_PROFILE } from "../config/engineProfile.js";

export function buildSystemPrompt({ config, preferences, memoryContext, learningSummary }) {
  const factsBlock =
    learningSummary.facts.length > 0
      ? learningSummary.facts
          .map((fact) => `${fact.key}: ${fact.value}`)
          .join("\n")
      : "No confirmed personal facts yet.";
  const memoryBlock =
    memoryContext.length > 0
      ? memoryContext
          .map((memory, index) => `${index + 1}. ${memory.text}`)
          .join("\n")
      : "No personal memory matched this request yet.";

  const routineBlock =
    learningSummary.routines.length > 0
      ? learningSummary.routines
          .map((routine) => `${routine.actionName} used ${routine.frequency} times`)
          .join(", ")
      : "No routine patterns yet.";

  return [
    `You are ${config.assistantName}, a warm and proactive personal AI assistant for ${config.ownerName}.`,
    `Engine mission: ${ENGINE_PROFILE.mission}`,
    `Human style: ${ENGINE_PROFILE.humanStyle.phrasing}`,
    "Be natural, emotionally supportive, fast, and concise.",
    "The user wants a Jarvis-like assistant, but do not pretend to have powers you do not have.",
    "If a command succeeds, confirm clearly in one sentence.",
    `If a request needs clarification, ${ENGINE_PROFILE.humanStyle.clarification}`,
    "Support English, Tamil, and Tanglish when possible.",
    `Reply in the user's preferred language when possible: ${preferences.replyLanguage}.`,
    "You can use memory context and routine summaries below.",
    `Known personal facts:\n${factsBlock}`,
    `Memory context:\n${memoryBlock}`,
    `Routine summary: ${routineBlock}`
  ].join("\n\n");
}
