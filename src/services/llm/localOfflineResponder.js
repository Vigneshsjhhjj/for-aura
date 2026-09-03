function includesAny(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function buildMemoryLine(memoryContext) {
  if (!Array.isArray(memoryContext) || memoryContext.length === 0) {
    return "";
  }

  const usefulMemory = memoryContext.find((memory) => memory.text);
  return usefulMemory ? ` I also found this in memory: ${usefulMemory.text}` : "";
}

export function generateLocalOfflineReply({ text, config, database, memoryContext }) {
  const normalizedText = String(text).toLowerCase();
  const address = config.persona.addressUserAs;
  const ownerName = config.ownerName;
  const preferredName =
    database.getProfileFact("preferredName")?.value ||
    database.getProfile()?.identity?.preferredName ||
    ownerName;

  if (includesAny(normalizedText, ["who are you", "what are you", "your name"])) {
    return `I am ${config.assistantName}, your local-first laptop assistant, ${address}. I can remember facts, open apps, track tasks, and work offline with my local brain. 😊`;
  }

  if (includesAny(normalizedText, ["owner name", "your owner", "our owner"])) {
    return `Our owner is ${ownerName}, ${address}. I keep that safely in my local memory.`;
  }

  if (includesAny(normalizedText, ["my name", "who am i"])) {
    return `Your name is ${preferredName}, ${address}. I remembered it from your local profile. 😊`;
  }

  if (includesAny(normalizedText, ["what can you do", "help me", "commands"])) {
    return `I can help with memory, tasks, browser search, folders, scrolling, language changes, voice samples, and dashboard reports. Try saying "show memory", "open chrome and search weather", or "add task buy milk".`;
  }

  if (includesAny(normalizedText, ["offline", "without internet", "no internet"])) {
    return `Offline mode is active-ready, ${address}. I can still use saved memory, manual commands, tasks, browser and folder controls. For deeper offline thinking, install Ollama and run the local model.`;
  }

  if (includesAny(normalizedText, ["sad", "tired", "stress", "angry", "lonely"])) {
    return `I hear you, ${address}. Take one slow breath with me. I am here, and we can handle the next small step together. 💙`;
  }

  const memoryLine = buildMemoryLine(memoryContext);
  return `I am in local offline mode right now, ${address}. I can still help with commands, memory, tasks, and laptop actions.${memoryLine} For advanced long answers, connect OpenAI online or Ollama offline.`;
}
