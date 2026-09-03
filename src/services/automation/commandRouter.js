import { findLanguageByText } from "../../config/languages.js";

function makeCommand(intent, params = {}, extra = {}) {
  return {
    intent,
    params,
    requiresDangerousPermission: false,
    ...extra
  };
}

export function routeCommand(text) {
  const normalized = text.trim().toLowerCase();
  const language = findLanguageByText(normalized);

  if (normalized.includes("speak with me in") || normalized.includes("change language to")) {
    if (language) {
      return makeCommand("set-language", { languageId: language.id });
    }
  }

  const chromeSearchMatch =
    text.match(/(?:search|look up)\s+(.+?)\s+(?:in|on)\s+(?:chrome|browser)/i) ||
    text.match(/(?:open|go to)\s+(?:chrome|browser)\s+(?:and\s+)?search\s+(.+)/i);

  if (chromeSearchMatch) {
    return makeCommand("chrome-search", { query: chromeSearchMatch[1] });
  }

  const openUrlMatch = text.match(/(?:open|go to)\s+(https?:\/\/\S+|[\w.-]+\.[a-z]{2,}\S*)/i);
  if (openUrlMatch) {
    return makeCommand("open-url", { url: openUrlMatch[1] });
  }

  const knownFolderMatch = text.match(
    /(?:open|go to)\s+(?:the\s+)?(desktop|documents|downloads|videos|music|pictures)(?:\s+folder)?/i
  );
  if (knownFolderMatch) {
    return makeCommand("open-known-folder", { folderName: knownFolderMatch[1] });
  }

  const openVideoMatch =
    text.match(/(?:open|play)\s+(?:the\s+)?video\s+(.+)/i) ||
    text.match(/(?:open|play)\s+(.+?)\s+video/i);
  if (openVideoMatch) {
    return makeCommand("open-video-file", { query: openVideoMatch[1] });
  }

  const addTaskMatch = text.match(/(?:add|create|assign)\s+(?:a\s+)?task\s+(.+)/i);
  if (addTaskMatch) {
    return makeCommand("add-task", { title: addTaskMatch[1] });
  }

  if (/(?:show|list)\s+(?:my\s+)?tasks/i.test(text)) {
    return makeCommand("show-tasks");
  }

  const completeTaskMatch = text.match(/(?:complete|finish|mark done)\s+(?:task\s+)?(.+)/i);
  if (completeTaskMatch) {
    return makeCommand("complete-task", { matcher: completeTaskMatch[1] });
  }

  if (normalized.includes("show manual responses")) {
    return makeCommand("show-manual-responses");
  }

  if (normalized.includes("internal storage") || normalized.includes("c drive")) {
    return makeCommand("open-internal-storage");
  }

  if (normalized.includes("open chrome")) {
    return makeCommand("open-url", { url: "https://www.google.com" });
  }

  if (normalized.includes("scroll down") || normalized.includes("next reel")) {
    return makeCommand("scroll-window", { direction: "down", steps: 3 });
  }

  if (normalized.includes("scroll up") || normalized.includes("previous reel")) {
    return makeCommand("scroll-window", { direction: "up", steps: 3 });
  }

  if (normalized.includes("show architecture") || normalized.includes("show ai data")) {
    return makeCommand("show-architecture");
  }

  if (normalized.includes("show memory") || normalized.includes("show database")) {
    return makeCommand("show-memory");
  }

  if (normalized.includes("show performance") || normalized.includes("performance report")) {
    return makeCommand("show-performance");
  }

  if (
    normalized.includes("show brain") ||
    normalized.includes("show my ai brain") ||
    normalized.includes("show stored data")
  ) {
    return makeCommand("show-brain");
  }

  if (normalized.includes("show default commands") || normalized.includes("show commands")) {
    return makeCommand("show-default-commands");
  }

  if (normalized.includes("pause listening") || normalized.includes("stop listening")) {
    return makeCommand("pause-listening");
  }

  if (normalized.includes("resume listening") || normalized.includes("start listening")) {
    return makeCommand("resume-listening");
  }

  if (normalized.includes("shutdown")) {
    return makeCommand(
      "shutdown-computer",
      {},
      { requiresDangerousPermission: true }
    );
  }

  if (normalized.includes("restart")) {
    return makeCommand(
      "restart-computer",
      {},
      { requiresDangerousPermission: true }
    );
  }

  if (normalized.includes("lock")) {
    return makeCommand("lock-computer");
  }

  return null;
}
