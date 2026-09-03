import fs from "node:fs";
import path from "node:path";
import { safeResolve } from "../utils/jsonFile.js";

const DEFAULT_CONFIG = {
  assistantName: "AURA",
  ownerName: "Owner",
  persona: {
    addressUserAs: "master"
  },
  server: {
    host: "0.0.0.0",
    port: 4545,
    trustLocalNetwork: true
  },
  auth: {
    ownerToken: "change-this-owner-token",
    requireOwnerTokenForRemote: true
  },
  modes: {
    alwaysListen: true,
    autoStartListeningOnLoad: true,
    startupGreetingEnabled: true,
    startupGreetingText: "AURA is working for you.",
    autoLearn: true,
    cloudSync: false,
    allowDangerousSystemActions: false,
    preferOnlineForChat: true,
    allowBrowserAutomation: true,
    ownerOnlyTransparency: true,
    proactiveFollowUpMs: 16000,
    idlePresenceEnabled: true,
    idlePresenceMs: 300000,
    defaultInputLanguage: "en-IN",
    defaultReplyLanguage: "en-US"
  },
  models: {
    offline: {
      provider: "ollama",
      baseUrl: "http://127.0.0.1:11434",
      model: "llama3.1:8b"
    },
    online: {
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-5.4-mini",
      apiMode: "chat_completions"
    }
  },
  voices: {
    mode: "browser",
    rate: 0.96,
    pitch: 1,
    volume: 1,
    preferredVoiceNames: [],
    customTts: {
      provider: "none",
      baseUrl: "",
      model: "",
      enabled: false
    }
  },
  storage: {
    localDbPath: "./data/aura.db.json",
    voiceSamplesDir: "./data/voice-samples",
    manualResponsesPath: "./data/manual-responses.json",
    cloud: {
      provider: "supabase",
      url: "",
      apiKey: "",
      table: "aura_sync"
    }
  }
};

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base, patch) {
  if (!isObject(base) || !isObject(patch)) {
    return patch ?? base;
  }

  const output = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = output[key];
    output[key] = isObject(current) && isObject(value) ? deepMerge(current, value) : value;
  }

  return output;
}

export function loadConfig(projectRoot) {
  const localPath = path.resolve(projectRoot, "config.local.json");
  const examplePath = path.resolve(projectRoot, "config.example.json");
  const sourcePath = fs.existsSync(localPath) ? localPath : examplePath;
  const raw = fs.readFileSync(sourcePath, "utf8");
  const merged = deepMerge(DEFAULT_CONFIG, JSON.parse(raw));

  merged.storage.localDbPath = safeResolve(projectRoot, merged.storage.localDbPath);
  merged.storage.voiceSamplesDir = safeResolve(projectRoot, merged.storage.voiceSamplesDir);
  merged.storage.manualResponsesPath = safeResolve(projectRoot, merged.storage.manualResponsesPath);
  merged.paths = {
    projectRoot,
    webRoot: path.resolve(projectRoot, "web")
  };

  return merged;
}
