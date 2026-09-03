# AURA Copy Paste Guide

Create the files below in the same structure, then run `node src/index.js` or `deploy-aura-local.cmd`.

## package.json

```json
{
  "name": "aura-assistant",
  "version": "1.0.0",
  "description": "AURA is a local-first voice assistant starter kit with online and offline AI modes.",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  }
}

```

## .gitignore

```gitignore
config.local.json
node_modules
data/*.backup.json
data/runtime-logs

```

## config.example.json

```json
{
  "assistantName": "AURA",
  "ownerName": "Owner",
  "persona": {
    "addressUserAs": "master"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 4545,
    "trustLocalNetwork": true
  },
  "auth": {
    "ownerToken": "change-this-owner-token",
    "requireOwnerTokenForRemote": true
  },
  "modes": {
    "alwaysListen": true,
    "autoStartListeningOnLoad": true,
    "startupGreetingEnabled": true,
    "startupGreetingText": "AURA is working for you.",
    "autoLearn": true,
    "cloudSync": false,
    "allowDangerousSystemActions": false,
    "preferOnlineForChat": true,
    "allowBrowserAutomation": true,
    "ownerOnlyTransparency": true,
    "proactiveFollowUpMs": 16000,
    "idlePresenceEnabled": true,
    "idlePresenceMs": 300000,
    "defaultInputLanguage": "en-IN",
    "defaultReplyLanguage": "en-US"
  },
  "models": {
    "offline": {
      "provider": "ollama",
      "baseUrl": "http://127.0.0.1:11434",
      "model": "llama3.1:8b"
    },
    "online": {
      "provider": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "",
      "model": "gpt-5.4-mini",
      "apiMode": "chat_completions"
    }
  },
  "voices": {
    "mode": "browser",
    "rate": 0.96,
    "pitch": 1,
    "volume": 1,
    "preferredVoiceNames": [
      "Microsoft Heera Desktop",
      "Microsoft Aria Online (Natural)",
      "Google UK English Female"
    ],
    "customTts": {
      "provider": "none",
      "baseUrl": "",
      "model": "",
      "enabled": false
    }
  },
  "storage": {
    "localDbPath": "./data/aura.db.json",
    "voiceSamplesDir": "./data/voice-samples",
    "manualResponsesPath": "./data/manual-responses.json",
    "cloud": {
      "provider": "supabase",
      "url": "",
      "apiKey": "",
      "table": "aura_sync"
    }
  }
}

```

## config.local.json

```json
{
  "assistantName": "AURA",
  "ownerName": "vignesh",
  "persona": {
    "addressUserAs": "master"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 4545,
    "trustLocalNetwork": true
  },
  "auth": {
    "ownerToken": "token_vignesh",
    "requireOwnerTokenForRemote": true
  },
  "modes": {
    "alwaysListen": true,
    "autoStartListeningOnLoad": true,
    "startupGreetingEnabled": true,
    "startupGreetingText": "AURA is working for you.",
    "autoLearn": true,
    "cloudSync": false,
    "allowDangerousSystemActions": false,
    "preferOnlineForChat": true,
    "allowBrowserAutomation": true,
    "ownerOnlyTransparency": true,
    "proactiveFollowUpMs": 16000,
    "idlePresenceEnabled": true,
    "idlePresenceMs": 300000,
    "defaultInputLanguage": "en-IN",
    "defaultReplyLanguage": "en-US"
  },
  "models": {
    "offline": {
      "provider": "ollama",
      "baseUrl": "http://127.0.0.1:11434",
      "model": "llama3.1:8b"
    },
    "online": {
      "provider": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "",
      "model": "gpt-5.4-mini",
      "apiMode": "chat_completions"
    }
  },
  "voices": {
    "mode": "browser",
    "rate": 0.96,
    "pitch": 1,
    "volume": 1,
    "preferredVoiceNames": [
      "Microsoft Heera Desktop",
      "Microsoft Aria Online (Natural)",
      "Google UK English Female"
    ],
    "customTts": {
      "provider": "none",
      "baseUrl": "",
      "model": "",
      "enabled": false
    }
  },
  "storage": {
    "localDbPath": "./data/aura.db.json",
    "voiceSamplesDir": "./data/voice-samples",
    "manualResponsesPath": "./data/manual-responses.json",
    "cloud": {
      "provider": "supabase",
      "url": "",
      "apiKey": "",
      "table": "aura_sync"
    }
  }
}

```

## start-aura.cmd

```bat
@echo off
cd /d "%~dp0"
node src\index.js

```

## deploy-aura-local.cmd

```bat
@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

echo Starting AURA server...
start "AURA Server" cmd /k "cd /d ""%~dp0"" && node src\index.js"

timeout /t 3 >nul
start "" "http://localhost:4545"

echo AURA deployment launched.
echo Browser should open at http://localhost:4545
echo If voice does not start automatically, click Start Listening once.
pause

```

## open-aura-dashboard.cmd

```bat
@echo off
start "" "http://localhost:4545"

```

## view-aura-database.cmd

```bat
@echo off
cd /d "%~dp0"
notepad data\aura.db.json

```

## install-aura-startup.ps1

```powershell
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "AURA Local Assistant.lnk"
$targetPath = Join-Path $projectRoot "deploy-aura-local.cmd"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Start AURA local assistant on Windows login"
$shortcut.Save()

Write-Host "AURA startup shortcut created at: $shortcutPath"

```

## data\aura.db.json

```json
{
  "meta": {
    "version": 1,
    "assistantName": "AURA",
    "ownerName": "vignesh",
    "createdAt": "2026-04-24T00:00:00.000Z",
    "updatedAt": "2026-05-01T22:21:06.689Z"
  },
  "preferences": {
    "inputLanguage": "en-IN",
    "replyLanguage": "en-US",
    "alwaysListen": true,
    "voiceEnabled": true,
    "allowDangerousSystemActions": false,
    "allowBrowserAutomation": true
  },
  "profile": {
    "identity": {
      "preferredName": "Nila",
      "aliases": [
        "Arun",
        "Nila"
      ],
      "facts": {
        "preferredName": {
          "key": "preferredName",
          "value": "Nila",
          "sourceText": "my name is Nila",
          "createdAt": "2026-04-27T03:54:49.613Z",
          "updatedAt": "2026-04-27T03:59:20.549Z"
        }
      }
    },
    "voiceProfiles": [],
    "activeVoiceProfileId": null,
    "languagesUsed": [],
    "favoriteApps": [],
    "favoriteWebsites": [],
    "conversationStyle": "friendly",
    "lastKnownMood": "supportive"
  },
  "memories": [
    {
      "id": "b8180a88-87b5-439f-9566-552c9049080f",
      "kind": "assistant-presence",
      "text": "AURA: AURA is working for you, master.",
      "language": "en-US",
      "tags": [
        "startup-greeting",
        "assistant-initiated"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-05-01T22:21:06.689Z"
    },
    {
      "id": "e0196cf0-7b56-4e61-8d80-dae80356c642",
      "kind": "conversation",
      "text": "User: what is our owner name\nAURA: His name is vignesh.",
      "language": "en-US",
      "tags": [
        "conversation",
        "manual-response"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-05-01T22:21:06.585Z"
    },
    {
      "id": "b8491180-1ea7-455d-84c6-ae04e184115b",
      "kind": "assistant-follow-up",
      "text": "AURA: I am still here with you. What do you want to do next?",
      "language": "en-US",
      "tags": [
        "follow-up",
        "assistant-initiated"
      ],
      "importance": 3,
      "metadata": {},
      "createdAt": "2026-04-27T04:20:42.885Z"
    },
    {
      "id": "f1d65a1e-643e-4016-97ed-b0edba1deff6",
      "kind": "conversation",
      "text": "User: what is my name\nAURA: Your name is Nila. I have it saved in your long-term memory.",
      "language": "en-US",
      "tags": [
        "conversation",
        "profile-memory"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-04-27T03:59:20.646Z"
    },
    {
      "id": "5a9ed972-4b16-4cd7-b2cd-092bd2fbba17",
      "kind": "conversation",
      "text": "User: my name is Nila\nAURA: I will remember that your name is Nila.",
      "language": "en-US",
      "tags": [
        "conversation",
        "profile-memory"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-04-27T03:59:20.550Z"
    },
    {
      "id": "114fdb34-f2bd-4fec-989c-3c5d12b155f5",
      "kind": "personal-fact",
      "text": "Stored preferredName: Nila",
      "language": "en-US",
      "tags": [
        "fact",
        "preferredName"
      ],
      "importance": 10,
      "metadata": {
        "sourceText": "my name is Nila"
      },
      "createdAt": "2026-04-27T03:59:20.549Z"
    },
    {
      "id": "41c7accc-cbcb-4092-b7c5-e66b8359527a",
      "kind": "conversation",
      "text": "User: what is my name\nAURA: Your name is Arun. I have it saved in your long-term memory.",
      "language": "en-US",
      "tags": [
        "conversation",
        "profile-memory"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-04-27T03:54:49.689Z"
    },
    {
      "id": "2d580107-991e-4b19-9192-ff2c707d6fd4",
      "kind": "conversation",
      "text": "User: my name is Arun\nAURA: I will remember that your name is Arun.",
      "language": "en-US",
      "tags": [
        "conversation",
        "profile-memory"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-04-27T03:54:49.614Z"
    },
    {
      "id": "d78f8697-7156-44c9-9bdf-93feb5df2fb2",
      "kind": "personal-fact",
      "text": "Stored preferredName: Arun",
      "language": "en-US",
      "tags": [
        "fact",
        "preferredName"
      ],
      "importance": 10,
      "metadata": {
        "sourceText": "my name is Arun"
      },
      "createdAt": "2026-04-27T03:54:49.613Z"
    },
    {
      "id": "c07fee96-9c30-4a12-91b6-1d73220f1d53",
      "kind": "conversation",
      "text": "User: hello aura\nAURA: I am running in limited local mode right now. I can still help with browser, system, memory, and dashboard actions, but your online or offline model is not connected yet.",
      "language": "en-US",
      "tags": [
        "conversation",
        "local-fallback"
      ],
      "importance": 2,
      "metadata": {},
      "createdAt": "2026-04-25T03:18:37.172Z"
    }
  ],
  "events": [
    {
      "id": "ef67e45e-81ca-4f9f-8e49-3f7d369a1a6c",
      "type": "presence-prompt",
      "text": "AURA is working for you, master.",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "reason": "startup-greeting",
        "language": "en-US"
      },
      "createdAt": "2026-05-01T22:21:06.688Z"
    },
    {
      "id": "895c6be9-a7af-42e6-be71-01fa53051a55",
      "type": "conversation",
      "text": "what is our owner name",
      "success": true,
      "latencyMs": 6,
      "metadata": {
        "language": "en-US",
        "provider": "manual-response"
      },
      "createdAt": "2026-05-01T22:21:06.584Z"
    },
    {
      "id": "9f4c076c-b786-452d-a439-6219f4253006",
      "type": "voice",
      "text": "what is our owner name",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-05-01T22:21:06.578Z"
    },
    {
      "id": "dedf603f-0eb5-4a6c-afbd-dfc5c29779b4",
      "type": "command",
      "text": "show my tasks",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "stderr": "",
        "stdout": "",
        "language": "en-US",
        "actionName": "show-tasks"
      },
      "createdAt": "2026-05-01T22:19:54.431Z"
    },
    {
      "id": "b74a8a91-b98b-45af-9b0f-304e484c76cd",
      "type": "voice",
      "text": "show my tasks",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-05-01T22:19:54.427Z"
    },
    {
      "id": "970b674e-a3dd-4b6d-a515-210cadbeac14",
      "type": "command",
      "text": "add task call electrician",
      "success": true,
      "latencyMs": 1,
      "metadata": {
        "stderr": "",
        "stdout": "",
        "language": "en-US",
        "actionName": "add-task"
      },
      "createdAt": "2026-05-01T22:19:54.347Z"
    },
    {
      "id": "9160ed07-9568-43bc-aa9b-a439b83dda57",
      "type": "voice",
      "text": "add task call electrician",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-05-01T22:19:54.339Z"
    },
    {
      "id": "5c09e83a-1438-4da2-8469-e17bc540fd46",
      "type": "proactive-follow-up",
      "text": "I am still here with you. What do you want to do next?",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "reason": "user-silence",
        "language": "en-US"
      },
      "createdAt": "2026-04-27T04:20:42.884Z"
    },
    {
      "id": "53f6e9fe-99e8-4618-9d68-793b51e0cb4b",
      "type": "command",
      "text": "show my ai brain",
      "success": true,
      "latencyMs": 1,
      "metadata": {
        "stderr": "",
        "stdout": "",
        "language": "en-US",
        "actionName": "show-brain"
      },
      "createdAt": "2026-04-27T04:20:42.818Z"
    },
    {
      "id": "f75e4703-b83a-45d7-8675-d0fd8020da57",
      "type": "voice",
      "text": "show my ai brain",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-27T04:20:42.812Z"
    },
    {
      "id": "2c7f1439-6209-41b0-8f00-6c7a81151ab6",
      "type": "conversation",
      "text": "what is my name",
      "success": true,
      "latencyMs": 2,
      "metadata": {
        "language": "en-US",
        "provider": "profile-memory"
      },
      "createdAt": "2026-04-27T03:59:20.646Z"
    },
    {
      "id": "58d11905-ce8b-4697-adf3-930513f612bf",
      "type": "voice",
      "text": "what is my name",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-27T03:59:20.644Z"
    },
    {
      "id": "0421f61a-6983-4171-95d7-71b2af92558e",
      "type": "conversation",
      "text": "my name is Nila",
      "success": true,
      "latencyMs": 4,
      "metadata": {
        "language": "en-US",
        "provider": "profile-memory"
      },
      "createdAt": "2026-04-27T03:59:20.550Z"
    },
    {
      "id": "2d6c0fad-6004-434d-bcb8-af6541ee2f71",
      "type": "voice",
      "text": "my name is Nila",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-27T03:59:20.546Z"
    },
    {
      "id": "3b39a7bc-babf-46da-95fb-25ed0ef2d8a6",
      "type": "conversation",
      "text": "what is my name",
      "success": true,
      "latencyMs": 2,
      "metadata": {
        "language": "en-US",
        "provider": "profile-memory"
      },
      "createdAt": "2026-04-27T03:54:49.688Z"
    },
    {
      "id": "4568ae12-5c84-45b2-a9d8-f83569f0611f",
      "type": "voice",
      "text": "what is my name",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-27T03:54:49.686Z"
    },
    {
      "id": "3846c3d3-edff-4cf6-8b5c-e1d419f95981",
      "type": "conversation",
      "text": "my name is Arun",
      "success": true,
      "latencyMs": 6,
      "metadata": {
        "language": "en-US",
        "provider": "profile-memory"
      },
      "createdAt": "2026-04-27T03:54:49.614Z"
    },
    {
      "id": "8442f2bd-d26f-4373-b24e-5aaa879e709b",
      "type": "voice",
      "text": "my name is Arun",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-27T03:54:49.609Z"
    },
    {
      "id": "2b08e16f-382a-4119-af30-f2fc7b1923d8",
      "type": "conversation",
      "text": "hello aura",
      "success": true,
      "latencyMs": 35,
      "metadata": {
        "language": "en-US",
        "provider": "local-fallback"
      },
      "createdAt": "2026-04-25T03:18:37.170Z"
    },
    {
      "id": "372b1712-6e16-42c1-87cf-2948917f6e26",
      "type": "voice",
      "text": "hello aura",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-25T03:18:37.136Z"
    },
    {
      "id": "eb8303d6-cf4f-4459-b7ef-683fb1b1bc4d",
      "type": "command",
      "text": "show ai data",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "stderr": "",
        "stdout": "",
        "language": "en-US",
        "actionName": "show-architecture"
      },
      "createdAt": "2026-04-25T03:17:43.813Z"
    },
    {
      "id": "cc3dcd63-016e-4f63-88f6-46745c63c1e4",
      "type": "voice",
      "text": "show ai data",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-25T03:17:43.809Z"
    },
    {
      "id": "9f5d6ffa-e07d-4623-92aa-de905b71644d",
      "type": "voice",
      "text": "hello aura",
      "success": true,
      "latencyMs": 0,
      "metadata": {
        "language": "en-IN",
        "source": "test"
      },
      "createdAt": "2026-04-25T03:17:39.849Z"
    }
  ],
  "routines": [
    {
      "id": "7d31c552-36f3-44e6-923a-a4f0f4c62de4",
      "actionName": "show-architecture",
      "frequency": 1,
      "lastUsedAt": "2026-04-25T03:17:43.814Z",
      "lastTriggerText": "show ai data"
    },
    {
      "id": "a31a0ad3-38b6-467c-ad3e-1aaaf24f2120",
      "actionName": "show-brain",
      "frequency": 1,
      "lastUsedAt": "2026-04-27T04:20:42.819Z",
      "lastTriggerText": "show my ai brain"
    },
    {
      "id": "3b7489e8-641e-4c00-a529-1da2718cbe63",
      "actionName": "add-task",
      "frequency": 1,
      "lastUsedAt": "2026-05-01T22:19:54.348Z",
      "lastTriggerText": "add task call electrician"
    },
    {
      "id": "5c5f76f3-757a-4d80-9e26-5b765c6d93a4",
      "actionName": "show-tasks",
      "frequency": 1,
      "lastUsedAt": "2026-05-01T22:19:54.432Z",
      "lastTriggerText": "show my tasks"
    }
  ],
  "tasks": [
    {
      "id": "98f0708c-028e-48f0-9738-2727e42d68ba",
      "title": "call electrician",
      "status": "pending",
      "sourceText": "add task call electrician",
      "createdAt": "2026-05-01T22:19:54.346Z",
      "completedAt": null
    }
  ]
}

```

## data\manual-responses.json

```json
[
  {
    "id": "owner-name",
    "match": "exact",
    "triggers": [
      "what is our owner name",
      "who is our owner",
      "who is your owner"
    ],
    "response": "His name is {ownerName}."
  },
  {
    "id": "working-status",
    "match": "includes",
    "triggers": [
      "are you working",
      "aura are you there",
      "are you online"
    ],
    "response": "I am here and working for you, {addressUserAs}."
  },
  {
    "id": "need-help",
    "match": "includes",
    "triggers": [
      "do you need anything",
      "anything else"
    ],
    "response": "I am ready to help with your next task, {addressUserAs}."
  }
]

```

## src\index.js

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config/loadConfig.js";
import { LocalDatabase } from "./services/memory/localDatabase.js";
import { BehaviorTracker } from "./services/learning/behaviorTracker.js";
import { PerformanceReporter } from "./services/analytics/performanceReporter.js";
import { OpenAIClient } from "./services/llm/openaiClient.js";
import { OllamaClient } from "./services/llm/ollamaClient.js";
import { SupabaseSync } from "./services/cloud/supabaseSync.js";
import { AuraEngine } from "./core/auraEngine.js";
import { createServer } from "./api/server.js";
import { logInfo, logError } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const config = loadConfig(projectRoot);
const database = new LocalDatabase(config.storage.localDbPath, config);
database.init();

const behaviorTracker = new BehaviorTracker(database);
const performanceReporter = new PerformanceReporter(database);
const openAIClient = new OpenAIClient(config.models.online);
const ollamaClient = new OllamaClient(config.models.offline);
const cloudSync = new SupabaseSync(config.storage.cloud);

const engine = new AuraEngine({
  config,
  database,
  behaviorTracker,
  performanceReporter,
  openAIClient,
  ollamaClient,
  cloudSync
});

const server = createServer({ config, engine, database });

server.listen(config.server.port, config.server.host, () => {
  logInfo(
    `${config.assistantName} is running at http://localhost:${config.server.port}`
  );
});

server.on("error", (error) => {
  logError("Server failed to start.", error);
});

```

## src\api\server.js

```js
import fs from "node:fs";
import path from "node:path";
import { createServer as createHttpServer } from "node:http";
import { DEFAULT_COMMANDS } from "../config/defaultCommands.js";
import { LANGUAGE_OPTIONS } from "../config/languages.js";

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Aura-Owner-Token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  response.end(`${JSON.stringify(data, null, 2)}\n`);
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  response.end(text);
}

function isLoopbackAddress(clientAddress) {
  const normalized = clientAddress?.replace("::ffff:", "") ?? "";
  return normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost";
}

function isPrivateAddress(clientAddress) {
  const normalized = clientAddress?.replace("::ffff:", "") ?? "";
  return (
    normalized.startsWith("192.168.") ||
    normalized.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

function verifyOwner(request, config) {
  const clientAddress = request.socket.remoteAddress ?? "";
  const providedToken = request.headers["x-aura-owner-token"];

  if (isLoopbackAddress(clientAddress)) {
    return true;
  }

  if (config.server.trustLocalNetwork && isPrivateAddress(clientAddress)) {
    return providedToken === config.auth.ownerToken;
  }

  return providedToken === config.auth.ownerToken;
}

async function parseJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sanitizeFileSegment(value) {
  return value.replace(/[^a-z0-9-_]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function requireOwnerAccess(request, response, config) {
  if (!config.modes.ownerOnlyTransparency) {
    return true;
  }

  if (verifyOwner(request, config)) {
    return true;
  }

  sendJson(response, 403, {
    ok: false,
    error: "Owner verification required for private AURA transparency data."
  });
  return false;
}

function serveStaticFile(webRoot, requestPath, response) {
  const cleanPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.resolve(webRoot, `.${cleanPath}`);
  if (!filePath.startsWith(webRoot)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, "Not Found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentTypeMap = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml"
  };

  const content = fs.readFileSync(filePath);
  sendText(response, 200, content, contentTypeMap[extension] ?? "application/octet-stream");
}

export function createServer({ config, engine, database }) {
  const eventClients = new Set();

  engine.on("state", (payload) => {
    const serialized = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of eventClients) {
      client.write(serialized);
    }
  });

  return createHttpServer(async (request, response) => {
    if (!request.url) {
      sendText(response, 400, "Bad Request");
      return;
    }

    const parsedUrl = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-Aura-Owner-Token",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      });
      response.end();
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        assistantName: config.assistantName,
        uptimeMs: Date.now() - new Date(engine.state.bootedAt).getTime()
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/state") {
      sendJson(response, 200, engine.getPublicState());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/events") {
      response.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*"
      });
      response.write(`data: ${JSON.stringify(engine.getPublicState())}\n\n`);
      eventClients.add(response);
      request.on("close", () => {
        eventClients.delete(response);
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/architecture") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getArchitectureReport());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/memory") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, {
        profile: database.getProfile(),
        preferences: database.getPreferences(),
        recentEvents: database.getRecentEvents(30),
        learning: database.getLearningSummary(),
        voiceProfiles: database.getVoiceProfiles(),
        tasks: database.getTasks(),
        databaseConnection: {
          localJsonFile: config.storage.localDbPath,
          cloudConfigured: Boolean(config.storage.cloud.url && config.storage.cloud.apiKey)
        }
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/performance") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getPerformanceReport());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/voice-profiles") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, {
        voiceMode: config.voices.mode,
        customTts: config.voices.customTts,
        ...database.getVoiceProfiles()
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/brain") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getBrainSnapshot());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/default-commands") {
      sendJson(response, 200, {
        defaultCommands: DEFAULT_COMMANDS
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/languages") {
      sendJson(response, 200, {
        languages: LANGUAGE_OPTIONS
      });
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/talk") {
      try {
        const body = await parseJsonBody(request);
        const ownerVerified = verifyOwner(request, config);
        const result = await engine.processUserText({
          text: body.text ?? "",
          source: body.source ?? "voice",
          ownerVerified
        });
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 500, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/preferences") {
      try {
        const body = await parseJsonBody(request);
        const nextPreferences = engine.updatePreferences(body);
        sendJson(response, 200, {
          ok: true,
          preferences: nextPreferences
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/runtime") {
      try {
        const body = await parseJsonBody(request);
        const nextState = engine.updateRuntime({
          onlinePreferred:
            typeof body.onlinePreferred === "boolean"
              ? body.onlinePreferred
              : engine.state.onlinePreferred,
          speaking:
            typeof body.speaking === "boolean" ? body.speaking : engine.state.speaking
        });
        sendJson(response, 200, {
          ok: true,
          ...nextState
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/proactive-follow-up") {
      try {
        const result = engine.createProactiveFollowUp();
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/presence-prompt") {
      try {
        const body = await parseJsonBody(request);
        const result = engine.createPresencePrompt(body.reason ?? "idle-help");
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/voice-profiles") {
      try {
        const ownerVerified = verifyOwner(request, config);
        if (!ownerVerified) {
          sendJson(response, 403, {
            ok: false,
            error: "Owner verification failed."
          });
          return;
        }

        const body = await parseJsonBody(request);
        const label = String(body.label ?? "Custom Voice").trim();
        const mimeType = String(body.mimeType ?? "audio/webm");
        const base64Audio = String(body.base64Audio ?? "");

        if (!base64Audio) {
          sendJson(response, 400, {
            ok: false,
            error: "Missing base64Audio payload."
          });
          return;
        }

        const extensionMap = {
          "audio/webm": ".webm",
          "audio/wav": ".wav",
          "audio/mpeg": ".mp3"
        };
        const extension = extensionMap[mimeType] ?? ".bin";
        const safeLabel = sanitizeFileSegment(label || "custom-voice");
        const fileName = `${Date.now()}-${safeLabel}${extension}`;
        const targetPath = path.resolve(config.storage.voiceSamplesDir, fileName);
        const buffer = Buffer.from(base64Audio, "base64");

        fs.mkdirSync(config.storage.voiceSamplesDir, { recursive: true });
        fs.writeFileSync(targetPath, buffer);

        const createdVoiceProfile = database.addVoiceProfile({
          label,
          fileName,
          relativePath: path.relative(config.paths.projectRoot, targetPath),
          mimeType,
          sizeBytes: buffer.byteLength
        });

        sendJson(response, 200, {
          ok: true,
          message:
            "Voice sample stored. Browser TTS will still be used until you connect a custom TTS engine.",
          voiceProfile: createdVoiceProfile,
          voiceProfiles: database.getVoiceProfiles()
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/voice-profiles/activate") {
      try {
        const ownerVerified = verifyOwner(request, config);
        if (!ownerVerified) {
          sendJson(response, 403, {
            ok: false,
            error: "Owner verification failed."
          });
          return;
        }

        const body = await parseJsonBody(request);
        const activeVoice = database.setActiveVoiceProfile(String(body.voiceProfileId ?? ""));
        if (!activeVoice) {
          sendJson(response, 404, {
            ok: false,
            error: "Voice profile not found."
          });
          return;
        }

        sendJson(response, 200, {
          ok: true,
          activeVoice,
          voiceProfiles: database.getVoiceProfiles()
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    serveStaticFile(config.paths.webRoot, parsedUrl.pathname, response);
  });
}

```

## src\config\defaultCommands.js

```js
export const DEFAULT_COMMANDS = [
  {
    id: "show-brain",
    intent: "show-brain",
    title: "Show AURA Brain",
    description: "Shows the private owner-only view of everything AURA stores locally.",
    examplePhrases: [
      "show my ai brain",
      "show what is stored in your brain",
      "show all stored data"
    ]
  },
  {
    id: "show-memory",
    intent: "show-memory",
    title: "Show Memory",
    description: "Shows memory, learning, recent events, and saved profile facts.",
    examplePhrases: ["show memory", "show database", "show learning data"]
  },
  {
    id: "show-performance",
    intent: "show-performance",
    title: "Show Performance",
    description: "Shows latency, provider usage, and command success rate.",
    examplePhrases: ["show performance", "performance report", "show speed report"]
  },
  {
    id: "show-manual-responses",
    intent: "show-manual-responses",
    title: "Show Manual Responses",
    description: "Shows your custom quick replies from the manual response file.",
    examplePhrases: ["show manual responses"]
  },
  {
    id: "chrome-search",
    intent: "chrome-search",
    title: "Chrome Search",
    description: "Opens Chrome and searches for what you ask.",
    examplePhrases: [
      "open chrome and search latest ai news",
      "search weather in chrome"
    ]
  },
  {
    id: "open-internal-storage",
    intent: "open-internal-storage",
    title: "Internal Storage",
    description: "Opens your C drive in File Explorer.",
    examplePhrases: ["go to internal storage", "open c drive"]
  },
  {
    id: "open-known-folder",
    intent: "open-known-folder",
    title: "Open Known Folder",
    description: "Opens Desktop, Documents, Downloads, Videos, Music, or Pictures.",
    examplePhrases: ["open downloads folder", "open videos folder", "open documents"]
  },
  {
    id: "open-video-file",
    intent: "open-video-file",
    title: "Open Video",
    description: "Searches common folders for a video and opens it.",
    examplePhrases: ["open video trailer", "play video demo"]
  },
  {
    id: "scroll-window",
    intent: "scroll-window",
    title: "Scroll Window",
    description: "Scrolls the active window or reel up or down.",
    examplePhrases: ["scroll down", "scroll up", "next reel", "previous reel"]
  },
  {
    id: "set-language",
    intent: "set-language",
    title: "Change Language",
    description: "Changes AURA reply and listening language.",
    examplePhrases: [
      "speak with me in tamil",
      "change language to english",
      "change language to tanglish"
    ]
  },
  {
    id: "pause-listening",
    intent: "pause-listening",
    title: "Pause Listening",
    description: "Turns off always-listening mode until you re-enable it.",
    examplePhrases: ["pause listening", "stop listening"]
  },
  {
    id: "resume-listening",
    intent: "resume-listening",
    title: "Resume Listening",
    description: "Turns on always-listening mode with no wake word.",
    examplePhrases: ["resume listening", "start listening"]
  },
  {
    id: "add-task",
    intent: "add-task",
    title: "Add Task",
    description: "Stores a personal task in AURA's task list.",
    examplePhrases: ["add task call electrician", "assign task finish project report"]
  },
  {
    id: "show-tasks",
    intent: "show-tasks",
    title: "Show Tasks",
    description: "Shows the tasks currently stored for you.",
    examplePhrases: ["show my tasks", "list tasks"]
  },
  {
    id: "complete-task",
    intent: "complete-task",
    title: "Complete Task",
    description: "Marks a stored task as completed.",
    examplePhrases: ["complete task call electrician", "mark done project report"]
  }
];

```

## src\config\engineProfile.js

```js
export const ENGINE_PROFILE = {
  name: "AURA Human Presence Engine",
  version: 2,
  mission:
    "Act like a calm, proactive, emotionally aware personal assistant that speaks naturally and remembers important owner facts.",
  cognitiveLayers: [
    "speech perception",
    "command detection",
    "personal memory recall",
    "online reasoning",
    "offline fallback reasoning",
    "behavior learning",
    "proactive presence"
  ],
  humanStyle: {
    tone: "warm, grounded, concise, supportive",
    phrasing:
      "Use natural spoken sentences. Avoid robotic bullet-like wording unless the user asked for structure.",
    clarification:
      "Ask one simple question when you need missing information. Keep the question human and direct."
  },
  silenceFollowUps: [
    "I did not hear your reply. Are you still there?",
    "I am still here with you. What do you want to do next?",
    "You went quiet for a moment. Do you want me to continue?"
  ],
  startupGreetings: [
    "AURA is working for you.",
    "AURA is online and ready for you.",
    "I am here and ready to work with you."
  ],
  idlePresencePrompts: [
    "Any more help, master?",
    "Do you want me to help with anything else, master?",
    "I am still here if you need anything, master."
  ]
};

export function inferReplyExpectation(text) {
  if (!text) {
    return false;
  }

  return /\?["')\]]*\s*$/u.test(text.trim()) || text.includes("?");
}

export function pickSilenceFollowUp(lastAssistantText) {
  if (inferReplyExpectation(lastAssistantText)) {
    return ENGINE_PROFILE.silenceFollowUps[0];
  }

  return ENGINE_PROFILE.silenceFollowUps[1];
}

export function pickStartupGreeting(config) {
  return config?.modes?.startupGreetingText || ENGINE_PROFILE.startupGreetings[0];
}

export function pickIdlePresencePrompt() {
  return ENGINE_PROFILE.idlePresencePrompts[0];
}

```

## src\config\languages.js

```js
export const LANGUAGE_OPTIONS = [
  { id: "en-US", label: "English (US)", aliases: ["english", "speak english", "english us"] },
  { id: "en-IN", label: "English (India)", aliases: ["indian english", "english india"] },
  { id: "ta-IN", label: "Tamil", aliases: ["tamil", "tamizh"] },
  { id: "ta-IN-x-tanglish", label: "Tanglish", aliases: ["tanglish", "tamil english mix", "tamil mix"] },
  { id: "hi-IN", label: "Hindi", aliases: ["hindi"] },
  { id: "te-IN", label: "Telugu", aliases: ["telugu"] }
];

export function findLanguageByText(text) {
  const normalized = text.toLowerCase();
  return LANGUAGE_OPTIONS.find((language) =>
    language.aliases.some((alias) => normalized.includes(alias))
  );
}

```

## src\config\loadConfig.js

```js
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

```

## src\core\auraEngine.js

```js
import { EventEmitter } from "node:events";
import { DEFAULT_COMMANDS } from "../config/defaultCommands.js";
import {
  ENGINE_PROFILE,
  inferReplyExpectation,
  pickIdlePresencePrompt,
  pickSilenceFollowUp,
  pickStartupGreeting
} from "../config/engineProfile.js";
import { routeCommand } from "../services/automation/commandRouter.js";
import {
  findAndOpenVideoByName,
  openKnownFolder,
  openChromeSearch,
  openInternalStorage,
  openUrl,
  scrollActiveWindow
} from "../services/automation/browserActions.js";
import {
  lockComputer,
  restartComputer,
  shutdownComputer
} from "../services/automation/systemActions.js";
import {
  answerPersonalFactQuestion,
  extractPersonalFacts
} from "../services/learning/personalFacts.js";
import { ManualResponseStore } from "../services/manual/manualResponseStore.js";
import { buildSystemPrompt } from "./promptBuilder.js";

export class AuraEngine extends EventEmitter {
  constructor({
    config,
    database,
    behaviorTracker,
    performanceReporter,
    openAIClient,
    ollamaClient,
    cloudSync
  }) {
    super();
    this.config = config;
    this.database = database;
    this.behaviorTracker = behaviorTracker;
    this.performanceReporter = performanceReporter;
    this.openAIClient = openAIClient;
    this.ollamaClient = ollamaClient;
    this.cloudSync = cloudSync;
    this.manualResponseStore = new ManualResponseStore(
      config.storage.manualResponsesPath,
      () => ({
        assistantName: this.config.assistantName,
        ownerName: this.config.ownerName,
        addressUserAs: this.config.persona.addressUserAs
      })
    );
    this.state = {
      listening: config.modes.alwaysListen,
      onlinePreferred: config.modes.preferOnlineForChat,
      inputLanguage: config.modes.defaultInputLanguage,
      replyLanguage: config.modes.defaultReplyLanguage,
      lastUserText: "",
      lastAssistantText: "",
      lastLatencyMs: 0,
      lastProvider: "none",
      speaking: false,
      awaitingReply: false,
      bootedAt: new Date().toISOString()
    };
  }

  getPublicState() {
    return {
      assistantName: this.config.assistantName,
      ownerName: this.config.ownerName,
      state: structuredClone(this.state),
      preferences: this.database.getPreferences(),
      learning: this.behaviorTracker.getSummary(),
      voiceProfiles: this.database.getVoiceProfiles(),
      performance: this.performanceReporter.getSummary(),
      assistantSettings: {
        modes: {
          alwaysListen: this.config.modes.alwaysListen,
          autoStartListeningOnLoad: this.config.modes.autoStartListeningOnLoad,
          startupGreetingEnabled: this.config.modes.startupGreetingEnabled,
          startupGreetingText: this.config.modes.startupGreetingText,
          proactiveFollowUpMs: this.config.modes.proactiveFollowUpMs,
          ownerOnlyTransparency: this.config.modes.ownerOnlyTransparency,
          idlePresenceEnabled: this.config.modes.idlePresenceEnabled,
          idlePresenceMs: this.config.modes.idlePresenceMs
        },
        voices: {
          mode: this.config.voices.mode,
          rate: this.config.voices.rate,
          pitch: this.config.voices.pitch,
          volume: this.config.voices.volume,
          preferredVoiceNames: this.config.voices.preferredVoiceNames,
          customTtsEnabled: this.config.voices.customTts.enabled
        },
        persona: {
          addressUserAs: this.config.persona.addressUserAs
        }
      }
    };
  }

  updateState(patch) {
    this.state = {
      ...this.state,
      ...patch
    };
    this.emit("state", this.getPublicState());
  }

  updatePreferences(patch) {
    const preferences = this.database.updatePreferences(patch);
    this.updateState({
      inputLanguage: preferences.inputLanguage,
      replyLanguage: preferences.replyLanguage,
      listening: preferences.alwaysListen
    });
    return preferences;
  }

  updateRuntime(patch) {
    this.updateState(patch);
    return this.getPublicState();
  }

  async processUserText({ text, source = "voice", ownerVerified = false }) {
    const startedAt = Date.now();
    const trimmedText = text.trim();
    this.behaviorTracker.captureVoiceEvent({
      text: trimmedText,
      language: this.state.inputLanguage,
      source
    });
    this.behaviorTracker.updateProfileFromInteraction({ text: trimmedText });
    this.updateState({ lastUserText: trimmedText });

    const manualResponse = this.manualResponseStore.findMatch(trimmedText);
    if (manualResponse) {
      return this.finalizeLocalReply({
        startedAt,
        userText: trimmedText,
        replyText: manualResponse.replyText,
        provider: "manual-response",
        data: {
          matchedRuleId: manualResponse.id
        }
      });
    }

    const personalMemoryReply = this.handlePersonalMemory(trimmedText);
    if (personalMemoryReply) {
      return this.finalizeLocalReply({
        startedAt,
        userText: trimmedText,
        replyText: personalMemoryReply.replyText,
        provider: personalMemoryReply.provider,
        data: personalMemoryReply.data ?? null
      });
    }

    const command = routeCommand(trimmedText);
    if (command) {
      const result = await this.executeCommand({
        command,
        sourceText: trimmedText,
        ownerVerified
      });

      this.updateState({
        lastAssistantText: result.replyText,
        lastLatencyMs: Date.now() - startedAt,
        lastProvider: "local-command"
      });

      return {
        ok: result.ok,
        replyText: result.replyText,
        action: result.action,
        data: result.data ?? null,
        provider: "local-command",
        conversationState: this.getConversationState(result.replyText, result.action)
      };
    }

    const preferences = this.database.getPreferences();
    const memoryContext = this.database.searchMemories(trimmedText, 6);
    const learningSummary = this.behaviorTracker.getSummary();
    const systemPrompt = buildSystemPrompt({
      config: this.config,
      preferences,
      memoryContext,
      learningSummary
    });
    const conversation = [
      {
        role: "user",
        content: trimmedText
      }
    ];

    let assistantText = "";
    let provider = "offline-fallback";
    let lastModelError = null;

    if (this.state.onlinePreferred && this.openAIClient.enabled) {
      try {
        assistantText = await this.openAIClient.respond({ systemPrompt, conversation });
        provider = "openai";
      } catch (error) {
        assistantText = "";
        lastModelError = `OpenAI failed: ${error.message}`;
      }
    }

    if (!assistantText && this.ollamaClient.enabled) {
      try {
        assistantText = await this.ollamaClient.respond({ systemPrompt, conversation });
        provider = "ollama";
      } catch (error) {
        lastModelError = `Ollama failed: ${error.message}`;
      }
    }

    if (!assistantText) {
      assistantText =
        "I am running in limited local mode right now. I can still help with browser, system, memory, and dashboard actions, but your online or offline model is not connected yet.";
      provider = "local-fallback";
    }

    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureConversation({
      userText: trimmedText,
      assistantText,
      language: preferences.replyLanguage,
      provider,
      latencyMs
    });

    if (this.config.modes.cloudSync) {
      this.cloudSync.pushRecord("conversation", {
        userText: trimmedText,
        assistantText,
        provider,
        language: preferences.replyLanguage,
        lastModelError
      }).catch(() => {});
    }

    this.updateState({
      lastAssistantText: assistantText,
      lastLatencyMs: latencyMs,
      lastProvider: provider
    });

    return {
      ok: true,
      replyText: assistantText,
      provider,
      conversationState: this.getConversationState(assistantText)
    };
  }

  async executeCommand({ command, sourceText, ownerVerified }) {
    if (
      command.requiresDangerousPermission &&
      !this.config.modes.allowDangerousSystemActions
    ) {
      const replyText =
        "Dangerous system actions are disabled in config.local.json. Turn on allowDangerousSystemActions only if you fully trust this setup.";
      this.behaviorTracker.captureCommand({
        text: sourceText,
        actionName: command.intent,
        success: false,
        latencyMs: 0,
        metadata: { blocked: true }
      });
      return {
        ok: false,
        action: command.intent,
        replyText
      };
    }

    if (
      this.config.auth.requireOwnerTokenForRemote &&
      !ownerVerified &&
      command.requiresDangerousPermission
    ) {
      const replyText = "Owner verification is required for this command.";
      this.behaviorTracker.captureCommand({
        text: sourceText,
        actionName: command.intent,
        success: false,
        latencyMs: 0,
        metadata: { blocked: true, reason: "owner-verification-required" }
      });
      return {
        ok: false,
        action: command.intent,
        replyText
      };
    }

    const startedAt = Date.now();
    let replyText = "Done.";
    let actionResult = { ok: true, stdout: "", stderr: "" };
    let action = command.intent;
    let data = null;

    switch (command.intent) {
      case "set-language": {
        const preferences = this.updatePreferences({
          inputLanguage: command.params.languageId,
          replyLanguage: command.params.languageId
        });
        replyText = `Language changed to ${command.params.languageId}.`;
        data = preferences;
        break;
      }
      case "pause-listening": {
        const preferences = this.updatePreferences({
          alwaysListen: false
        });
        replyText = "I paused listening. You can start me again from the dashboard or say resume listening before pausing next time.";
        data = preferences;
        break;
      }
      case "resume-listening": {
        const preferences = this.updatePreferences({
          alwaysListen: true
        });
        replyText = "Always-listening mode is on again. I do not need a wake word.";
        data = preferences;
        break;
      }
      case "open-known-folder":
        actionResult = await openKnownFolder(command.params.folderName);
        replyText = `I opened the ${command.params.folderName} folder, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-video-file":
        actionResult = await findAndOpenVideoByName(command.params.query);
        replyText = `I opened it, ${this.config.persona.addressUserAs}.`;
        data = {
          matchedVideoPath: actionResult.stdout || ""
        };
        break;
      case "add-task": {
        const task = this.database.addTask(command.params.title, sourceText);
        replyText = `I saved the task '${task.title}'. I will keep it in your task list, ${this.config.persona.addressUserAs}.`;
        data = {
          task,
          tasks: this.database.getTasks()
        };
        break;
      }
      case "show-tasks":
        data = {
          tasks: this.database.getTasks()
        };
        replyText = "Showing your assigned tasks in the dashboard.";
        break;
      case "complete-task": {
        const task = this.database.completeTaskByMatcher(command.params.matcher);
        if (task) {
          replyText = `I marked '${task.title}' as completed, ${this.config.persona.addressUserAs}.`;
          data = {
            task,
            tasks: this.database.getTasks()
          };
        } else {
          actionResult = { ok: false, stdout: "", stderr: "Task not found." };
          replyText = "I could not find that task yet.";
        }
        break;
      }
      case "chrome-search":
        actionResult = await openChromeSearch(command.params.query);
        replyText = `I opened Chrome and searched for ${command.params.query}, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-url":
        actionResult = await openUrl(command.params.url);
        replyText = `I opened ${command.params.url}, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-internal-storage":
        actionResult = await openInternalStorage();
        replyText = `I opened your internal storage, ${this.config.persona.addressUserAs}.`;
        break;
      case "scroll-window":
        actionResult = await scrollActiveWindow(
          command.params.direction,
          command.params.steps
        );
        replyText =
          command.params.direction === "up"
            ? `I am scrolling up now, ${this.config.persona.addressUserAs}.`
            : `I am scrolling down now, ${this.config.persona.addressUserAs}.`;
        break;
      case "shutdown-computer":
        actionResult = await shutdownComputer();
        replyText = "Shutting down your computer.";
        break;
      case "restart-computer":
        actionResult = await restartComputer();
        replyText = "Restarting your computer.";
        break;
      case "lock-computer":
        actionResult = await lockComputer();
        replyText = "Locking your computer.";
        break;
      case "show-architecture":
        data = this.getArchitectureReport();
        replyText = "Opening the architecture data in the dashboard.";
        break;
      case "show-memory":
        data = {
          profile: this.database.getProfile(),
          preferences: this.database.getPreferences(),
          recentEvents: this.database.getRecentEvents(20),
          learning: this.behaviorTracker.getSummary(),
          voiceProfiles: this.database.getVoiceProfiles()
        };
        replyText = "Showing your memory and learning data in the dashboard.";
        break;
      case "show-brain":
        data = this.getBrainSnapshot();
        replyText = "Showing your private AURA brain data in the dashboard.";
        break;
      case "show-default-commands":
        data = {
          defaultCommands: DEFAULT_COMMANDS
        };
        replyText = "Showing the default command registry in the dashboard.";
        break;
      case "show-manual-responses":
        data = {
          manualResponses: this.manualResponseStore.getRules()
        };
        replyText = "Showing your manual response rules in the dashboard.";
        break;
      case "show-performance":
        data = this.performanceReporter.getReport();
        replyText = "Showing your performance report in the dashboard.";
        break;
      default:
        replyText = "I understood that as a command, but I do not have an executor for it yet.";
        actionResult = { ok: false, stdout: "", stderr: "Unknown command." };
        break;
    }

    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureCommand({
      text: sourceText,
      actionName: action,
      success: actionResult.ok,
      latencyMs,
      metadata: {
        stderr: actionResult.stderr,
        stdout: actionResult.stdout,
        language: this.state.replyLanguage
      }
    });

    if (actionResult.ok && this.config.modes.cloudSync) {
      this.cloudSync.pushRecord("command", {
        action,
        text: sourceText,
        latencyMs
      }).catch(() => {});
    }

    return {
      ok: actionResult.ok,
      action,
      replyText,
      data,
      latencyMs
    };
  }

  getArchitectureReport() {
    return {
      assistantName: this.config.assistantName,
      backendEntry: "src/index.js",
      apiServer: "src/api/server.js",
      coreBrain: "src/core/auraEngine.js",
      localDatabaseEngine: "src/services/memory/localDatabase.js",
      performanceEngine: "src/services/analytics/performanceReporter.js",
      onlineModel: this.config.models.online,
      offlineModel: this.config.models.offline,
      storage: {
        localDbPath: this.config.storage.localDbPath,
        voiceSamplesDir: this.config.storage.voiceSamplesDir,
        manualResponsesPath: this.config.storage.manualResponsesPath,
        cloud: this.config.storage.cloud,
        collections: ["preferences", "profile", "memories", "events", "routines", "tasks"]
      },
      engineProfile: {
        name: ENGINE_PROFILE.name,
        version: ENGINE_PROFILE.version,
        mission: ENGINE_PROFILE.mission,
        cognitiveLayers: ENGINE_PROFILE.cognitiveLayers
      },
      neuralLayers: {
        reasoning: this.openAIClient.enabled ? "OpenAI online model" : "Local fallback / Ollama",
        speechToText: "Browser SpeechRecognition by default, optional upgrade to Vosk or Whisper.cpp",
        textToSpeech: this.config.voices.customTts.enabled
          ? "Custom TTS adapter enabled"
          : "Browser SpeechSynthesis voices",
        learning: "Behavior tracking, memory retrieval, routine frequency analysis, and long-term fact storage"
      },
      apiRoutes: {
        talk: "/api/talk",
        memory: "/api/memory",
        performance: "/api/performance",
        voiceProfiles: "/api/voice-profiles",
        brain: "/api/brain",
        proactiveFollowUp: "/api/proactive-follow-up",
        defaultCommands: "/api/default-commands"
      }
    };
  }

  getPerformanceReport() {
    return this.performanceReporter.getReport();
  }

  getBrainSnapshot() {
    const snapshot = this.database.getSnapshot();
    return {
      assistantName: this.config.assistantName,
      ownerName: this.config.ownerName,
      privacy: {
        ownerOnlyTransparency: this.config.modes.ownerOnlyTransparency,
        localDatabasePath: this.config.storage.localDbPath,
        voiceSamplesDir: this.config.storage.voiceSamplesDir,
        manualResponsesPath: this.config.storage.manualResponsesPath
      },
      engineProfile: ENGINE_PROFILE,
      models: {
        online: {
          provider: this.config.models.online.provider,
          baseUrl: this.config.models.online.baseUrl,
          model: this.config.models.online.model,
          enabled: Boolean(this.config.models.online.apiKey)
        },
        offline: {
          provider: this.config.models.offline.provider,
          baseUrl: this.config.models.offline.baseUrl,
          model: this.config.models.offline.model,
          enabled: Boolean(this.config.models.offline.baseUrl)
        }
      },
      preferences: snapshot.preferences,
      profile: snapshot.profile,
      memories: snapshot.memories,
      events: snapshot.events,
      routines: snapshot.routines,
      tasks: snapshot.tasks,
      defaultCommands: DEFAULT_COMMANDS,
      manualResponses: this.manualResponseStore.getRules(),
      performance: this.getPerformanceReport()
    };
  }

  createProactiveFollowUp() {
    const replyText = pickSilenceFollowUp(this.state.lastAssistantText);
    this.database.addEvent({
      type: "proactive-follow-up",
      text: replyText,
      success: true,
      metadata: {
        reason: "user-silence",
        language: this.state.replyLanguage
      }
    });
    this.database.addMemory({
      kind: "assistant-follow-up",
      text: `AURA: ${replyText}`,
      language: this.state.replyLanguage,
      tags: ["follow-up", "assistant-initiated"],
      importance: 3
    });
    this.updateState({
      lastAssistantText: replyText,
      lastProvider: "proactive-follow-up",
      awaitingReply: true
    });
    return {
      ok: true,
      replyText,
      provider: "proactive-follow-up",
      conversationState: {
        expectReply: false,
        allowSilenceFollowUp: false,
        followUpDelayMs: this.config.modes.proactiveFollowUpMs
      }
    };
  }

  createPresencePrompt(reason = "idle-help") {
    const replyText =
      reason === "startup-greeting"
        ? `${pickStartupGreeting(this.config).replace(/[.?!]\s*$/, "")}, ${this.config.persona.addressUserAs}.`
        : pickIdlePresencePrompt();

    this.database.addEvent({
      type: "presence-prompt",
      text: replyText,
      success: true,
      metadata: {
        reason,
        language: this.state.replyLanguage
      }
    });

    this.database.addMemory({
      kind: "assistant-presence",
      text: `AURA: ${replyText}`,
      language: this.state.replyLanguage,
      tags: [reason, "assistant-initiated"],
      importance: 2
    });

    this.updateState({
      lastAssistantText: replyText,
      lastProvider: "presence-prompt"
    });

    return {
      ok: true,
      replyText,
      provider: "presence-prompt",
      reason,
      conversationState: {
        expectReply: false,
        allowSilenceFollowUp: false,
        followUpDelayMs: this.config.modes.proactiveFollowUpMs
      }
    };
  }

  getConversationState(replyText, action = "") {
    const expectReply = action.startsWith("show-")
      ? false
      : inferReplyExpectation(replyText);

    this.updateState({
      awaitingReply: expectReply
    });

    return {
      expectReply,
      allowSilenceFollowUp: expectReply,
      followUpDelayMs: this.config.modes.proactiveFollowUpMs
    };
  }

  handlePersonalMemory(text) {
    const profile = this.database.getProfile();
    const answer = answerPersonalFactQuestion(text, profile, this.config.ownerName);
    if (answer) {
      return {
        replyText: answer,
        provider: "profile-memory"
      };
    }

    const facts = extractPersonalFacts(text);
    if (facts.length === 0) {
      return null;
    }

    const storedFacts = facts.map((fact) =>
      this.database.upsertProfileFact(fact.key, fact.value, text)
    );

    for (const storedFact of storedFacts) {
      this.database.addMemory({
        kind: "personal-fact",
        text: `Stored ${storedFact.key}: ${storedFact.value}`,
        language: this.state.replyLanguage,
        tags: ["fact", storedFact.key],
        importance: 10,
        metadata: { sourceText: text }
      });
    }

    const preferredName = this.database.getProfileFact("preferredName")?.value;
    if (preferredName) {
      return {
        replyText: `I will remember that your name is ${preferredName}.`,
        provider: "profile-memory",
        data: {
          facts: storedFacts,
          profile: this.database.getProfile()
        }
      };
    }

    return {
      replyText: "I saved that to your long-term memory.",
      provider: "profile-memory",
      data: {
        facts: storedFacts,
        profile: this.database.getProfile()
      }
    };
  }

  finalizeLocalReply({ startedAt, userText, replyText, provider, data = null }) {
    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureConversation({
      userText,
      assistantText: replyText,
      language: this.state.replyLanguage,
      provider,
      latencyMs
    });
    this.updateState({
      lastAssistantText: replyText,
      lastLatencyMs: latencyMs,
      lastProvider: provider
    });
    return {
      ok: true,
      replyText,
      provider,
      data,
      conversationState: this.getConversationState(replyText)
    };
  }
}

```

## src\core\promptBuilder.js

```js
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

```

## src\services\analytics\performanceReporter.js

```js
function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio));
  return sorted[index];
}

export class PerformanceReporter {
  constructor(database) {
    this.database = database;
  }

  getReport() {
    const snapshot = this.database.getSnapshot();
    const events = snapshot.events ?? [];
    const timedEvents = events.filter((event) => Number(event.latencyMs) > 0);
    const latencies = timedEvents.map((event) => Number(event.latencyMs));
    const conversationEvents = events.filter((event) => event.type === "conversation");
    const commandEvents = events.filter((event) => event.type === "command");
    const providerCounts = new Map();

    for (const event of conversationEvents) {
      const provider = event.metadata?.provider ?? "unknown";
      providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
    }

    const commandSuccessCount = commandEvents.filter((event) => event.success).length;

    return {
      uptimeSignals: {
        totalEvents: events.length,
        totalMemories: snapshot.memories.length,
        totalFacts: Object.keys(snapshot.profile.identity.facts ?? {}).length,
        totalVoiceProfiles: snapshot.profile.voiceProfiles.length
      },
      latency: {
        averageMs: average(latencies),
        p95Ms: percentile(latencies, 0.95),
        fastestMs: latencies.length > 0 ? Math.min(...latencies) : 0,
        slowestMs: latencies.length > 0 ? Math.max(...latencies) : 0,
        last10: timedEvents.slice(0, 10).map((event) => ({
          type: event.type,
          latencyMs: event.latencyMs,
          at: event.createdAt
        }))
      },
      providers: [...providerCounts.entries()].map(([provider, count]) => ({
        provider,
        count
      })),
      commands: {
        total: commandEvents.length,
        successRate:
          commandEvents.length > 0
            ? Number(((commandSuccessCount / commandEvents.length) * 100).toFixed(1))
            : 0
      },
      storage: {
        localDatabase: this.database.filePath,
        cloudSyncEnabled: Boolean(this.database.config?.modes?.cloudSync)
      }
    };
  }

  getSummary() {
    const report = this.getReport();
    return {
      averageLatencyMs: report.latency.averageMs,
      totalEvents: report.uptimeSignals.totalEvents,
      totalFacts: report.uptimeSignals.totalFacts
    };
  }
}

```

## src\services\automation\browserActions.js

```js
import os from "node:os";
import path from "node:path";
import { escapePowerShellString, runPowerShell } from "./powershellBridge.js";

function normalizeUrl(urlOrQuery) {
  if (/^https?:\/\//i.test(urlOrQuery)) {
    return urlOrQuery;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(urlOrQuery)) {
    return `https://${urlOrQuery}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(urlOrQuery)}`;
}

export async function openChromeSearch(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  return openUrl(url, "chrome");
}

export async function openUrl(urlOrQuery, browserPreference = "chrome") {
  const url = normalizeUrl(urlOrQuery);
  const browser = browserPreference === "edge" ? "msedge.exe" : "chrome.exe";
  const safeUrl = escapePowerShellString(url);
  const script = `
    try {
      Start-Process '${browser}' -ArgumentList '${safeUrl}'
    } catch {
      Start-Process '${safeUrl}'
    }
  `;
  return runPowerShell(script);
}

export async function openInternalStorage() {
  return runPowerShell("Start-Process explorer.exe -ArgumentList 'C:\\'");
}

export async function openFolder(targetPath) {
  const safePath = escapePowerShellString(targetPath);
  return runPowerShell(`Start-Process explorer.exe -ArgumentList '${safePath}'`);
}

export function getKnownFolderPath(folderName) {
  const home = os.homedir();
  const knownFolders = {
    desktop: path.join(home, "Desktop"),
    documents: path.join(home, "Documents"),
    downloads: path.join(home, "Downloads"),
    videos: path.join(home, "Videos"),
    music: path.join(home, "Music"),
    pictures: path.join(home, "Pictures")
  };

  return knownFolders[String(folderName).toLowerCase()] ?? null;
}

export async function openKnownFolder(folderName) {
  const targetPath = getKnownFolderPath(folderName);
  if (!targetPath) {
    return { ok: false, code: 1, stdout: "", stderr: "Unknown folder." };
  }

  return openFolder(targetPath);
}

export async function findAndOpenVideoByName(query) {
  const safeQuery = escapePowerShellString(query);
  const script = `
    $roots = @(
      "$env:USERPROFILE\\Videos",
      "$env:USERPROFILE\\Desktop",
      "$env:USERPROFILE\\Downloads",
      "$env:USERPROFILE\\Documents"
    )
    $match = Get-ChildItem -Path $roots -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Extension -in @('.mp4', '.mkv', '.avi', '.mov', '.webm') -and
        $_.BaseName -like '*${safeQuery}*'
      } |
      Select-Object -First 1
    if ($match) {
      Start-Process -LiteralPath $match.FullName
      Write-Output $match.FullName
    } else {
      Write-Error 'Video not found.'
      exit 1
    }
  `;
  return runPowerShell(script, { timeoutMs: 30000 });
}

export async function scrollActiveWindow(direction = "down", steps = 3) {
  const key = direction === "up" ? "{PGUP}" : "{PGDN}";
  const repeatedKeys = new Array(Math.max(1, steps)).fill(key).join("");
  const safeKeys = escapePowerShellString(repeatedKeys);
  const script = `
    $wshell = New-Object -ComObject WScript.Shell
    Start-Sleep -Milliseconds 150
    $wshell.SendKeys('${safeKeys}')
  `;
  return runPowerShell(script);
}

```

## src\services\automation\commandRouter.js

```js
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

```

## src\services\automation\powershellBridge.js

```js
import { spawn } from "node:child_process";

export function escapePowerShellString(text) {
  return String(text).replace(/'/g, "''");
}

export function runPowerShell(script, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      {
        windowsHide: true
      }
    );

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("PowerShell command timed out."));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        ok: code === 0,
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

```

## src\services\automation\systemActions.js

```js
import { runPowerShell } from "./powershellBridge.js";

export async function shutdownComputer() {
  return runPowerShell("Stop-Computer -Force", { timeoutMs: 5000 });
}

export async function restartComputer() {
  return runPowerShell("Restart-Computer -Force", { timeoutMs: 5000 });
}

export async function lockComputer() {
  return runPowerShell("rundll32.exe user32.dll,LockWorkStation");
}

```

## src\services\cloud\supabaseSync.js

```js
export class SupabaseSync {
  constructor(cloudConfig) {
    this.cloudConfig = cloudConfig;
  }

  get enabled() {
    return Boolean(
      this.cloudConfig?.url &&
        this.cloudConfig?.apiKey &&
        this.cloudConfig?.table
    );
  }

  async pushRecord(recordType, payload) {
    if (!this.enabled) {
      return { ok: false, reason: "Cloud sync is disabled." };
    }

    const endpoint = `${this.cloudConfig.url}/rest/v1/${this.cloudConfig.table}`;
    const body = [
      {
        record_type: recordType,
        payload,
        created_at: new Date().toISOString()
      }
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.cloudConfig.apiKey,
        Authorization: `Bearer ${this.cloudConfig.apiKey}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(body)
    });

    return {
      ok: response.ok,
      status: response.status
    };
  }
}

```

## src\services\learning\behaviorTracker.js

```js
export class BehaviorTracker {
  constructor(database) {
    this.database = database;
  }

  captureVoiceEvent({ text, language, source }) {
    this.database.addEvent({
      type: "voice",
      text,
      success: true,
      metadata: { language, source }
    });
  }

  captureCommand({ text, actionName, success, latencyMs, metadata = {} }) {
    this.database.addEvent({
      type: "command",
      text,
      success,
      latencyMs,
      metadata: {
        ...metadata,
        actionName
      }
    });

    if (success) {
      this.database.recordRoutine(actionName, text);
    }
  }

  captureConversation({ userText, assistantText, language, provider, latencyMs }) {
    this.database.addEvent({
      type: "conversation",
      text: userText,
      success: true,
      latencyMs,
      metadata: {
        language,
        provider
      }
    });

    this.database.addMemory({
      kind: "conversation",
      text: `User: ${userText}\nAURA: ${assistantText}`,
      language,
      tags: ["conversation", provider],
      importance: 2
    });
  }

  updateProfileFromInteraction({ text }) {
    const lower = text.toLowerCase();
    this.database.updateProfile((profile) => {
      const nextProfile = { ...profile };

      if (lower.includes("chrome")) {
        nextProfile.favoriteApps = uniquePush(nextProfile.favoriteApps, "chrome");
      }

      if (lower.includes("youtube")) {
        nextProfile.favoriteWebsites = uniquePush(nextProfile.favoriteWebsites, "youtube");
      }

      if (lower.includes("tamil")) {
        nextProfile.languagesUsed = uniquePush(nextProfile.languagesUsed, "ta-IN");
      }

      if (lower.includes("english")) {
        nextProfile.languagesUsed = uniquePush(nextProfile.languagesUsed, "en-US");
      }

      return nextProfile;
    });
  }

  getSummary() {
    return this.database.getLearningSummary();
  }
}

function uniquePush(list, value) {
  const next = [...list];
  if (!next.includes(value)) {
    next.push(value);
  }
  return next;
}

```

## src\services\learning\personalFacts.js

```js
function cleanValue(value) {
  return value
    .trim()
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ");
}

export function extractPersonalFacts(text) {
  const facts = [];
  const nameMatch =
    text.match(/\bmy name is\s+([a-z][a-z\s'-]{0,40})/i) ||
    text.match(/\bcall me\s+([a-z][a-z\s'-]{0,40})/i);

  if (nameMatch) {
    facts.push({
      key: "preferredName",
      value: cleanValue(nameMatch[1])
    });
  }

  return facts;
}

export function answerPersonalFactQuestion(text, profile, ownerName = "") {
  const normalized = text.toLowerCase();
  const preferredName = profile.identity?.preferredName?.trim();

  if (
    /\b(what is my name|what's my name|tell me my name|who am i|do you remember my name)\b/i.test(
      normalized
    )
  ) {
    if (preferredName) {
      return `Your name is ${preferredName}. I have it saved in your long-term memory.`;
    }

    return "I do not know your name yet. Say 'my name is ...' and I will remember it.";
  }

  if (
    /\b(what is our owner name|who is our owner|who is your owner|what is your owner name)\b/i.test(
      normalized
    )
  ) {
    if (ownerName) {
      return `His name is ${ownerName}.`;
    }

    return "I do not have the owner name configured yet.";
  }

  return null;
}

```

## src\services\llm\ollamaClient.js

```js
export class OllamaClient {
  constructor(config) {
    this.config = config;
  }

  get enabled() {
    return Boolean(this.config?.baseUrl && this.config?.model);
  }

  async respond({ systemPrompt, conversation }) {
    if (!this.enabled) {
      throw new Error("Offline model is not configured.");
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    return payload?.message?.content?.trim() ?? "";
  }
}

```

## src\services\llm\openaiClient.js

```js
export class OpenAIClient {
  constructor(config) {
    this.config = config;
  }

  get enabled() {
    return Boolean(this.config?.apiKey && this.config?.model && this.config?.baseUrl);
  }

  async respond({ systemPrompt, conversation }) {
    if (!this.enabled) {
      throw new Error("OpenAI is not configured.");
    }

    const apiMode = this.config.apiMode ?? "chat_completions";
    return apiMode === "responses"
      ? this.respondWithResponsesApi({ systemPrompt, conversation })
      : this.respondWithChatCompletions({ systemPrompt, conversation });
  }

  async respondWithChatCompletions({ systemPrompt, conversation }) {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation
        ]
      })
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(`OpenAI chat completions failed: ${response.status} ${failureText}`);
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content?.trim() ?? "";
  }

  async respondWithResponsesApi({ systemPrompt, conversation }) {
    const response = await fetch(`${this.config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }]
          },
          ...conversation.map((message) => ({
            role: message.role,
            content: [{ type: "input_text", text: message.content }]
          }))
        ]
      })
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(`OpenAI responses API failed: ${response.status} ${failureText}`);
    }

    const payload = await response.json();
    const outputText = payload?.output_text?.trim?.();

    if (outputText) {
      return outputText;
    }

    const firstText = payload?.output?.[0]?.content?.[0]?.text?.trim?.();
    return firstText ?? "";
  }
}

```

## src\services\manual\manualResponseStore.js

```js
import { readJson } from "../../utils/jsonFile.js";

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

```

## src\services\memory\localDatabase.js

```js
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
      tasks: []
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
      tasks: Array.isArray(raw.tasks) ? raw.tasks : []
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

```

## src\utils\jsonFile.js

```js
import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJson(filePath, fallbackValue) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return structuredClone(fallbackValue);
  }
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function safeResolve(rootDir, maybeRelativePath) {
  return path.isAbsolute(maybeRelativePath)
    ? maybeRelativePath
    : path.resolve(rootDir, maybeRelativePath);
}

```

## src\utils\logger.js

```js
export function logInfo(message, details) {
  if (details) {
    console.log(`[AURA] ${message}`, details);
    return;
  }

  console.log(`[AURA] ${message}`);
}

export function logError(message, error) {
  console.error(`[AURA] ${message}`);
  if (error) {
    console.error(error);
  }
}

```

## web\index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AURA Control Room</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="page-shell">
      <header class="hero">
        <div>
          <p class="eyebrow">Personal AI Control Room</p>
          <h1>AURA</h1>
          <p class="hero-copy">
            Always-on voice assistant starter kit with local memory, browser control,
            daily learning, and online/offline AI routing.
          </p>
        </div>
        <div class="status-grid">
          <article class="status-card">
            <span>Status</span>
            <strong id="statusText">Booting</strong>
          </article>
          <article class="status-card">
            <span>Mode</span>
            <strong id="modeText">Online Preferred</strong>
          </article>
          <article class="status-card">
            <span>Latency</span>
            <strong id="latencyText">0 ms</strong>
          </article>
        </div>
      </header>

      <main class="dashboard">
        <section class="panel avatar-panel">
          <div class="avatar-stage" id="avatarStage">
            <div class="avatar-core">
              <div class="avatar-face">
                <span class="eye"></span>
                <span class="eye"></span>
                <span class="mouth"></span>
              </div>
            </div>
            <div class="ring ring-a"></div>
            <div class="ring ring-b"></div>
            <div class="ring ring-c"></div>
          </div>

          <div class="panel-copy">
            <h2>Voice Loop</h2>
            <p id="voiceStatus">
              Browser speech recognition will listen continuously when enabled.
            </p>
          </div>

          <div class="stack controls">
            <button id="listenToggle" class="primary-button">Start Listening</button>
            <button id="modeToggle" class="secondary-button">Switch To Offline</button>
            <button id="showArchitecture" class="ghost-button">Show AI Data</button>
            <button id="showMemory" class="ghost-button">Show Memory</button>
            <button id="showPerformance" class="ghost-button">Show Performance</button>
            <button id="showBrain" class="ghost-button">Show Brain</button>
          </div>
        </section>

        <section class="panel transcript-panel">
          <div class="panel-head">
            <h2>Conversation</h2>
            <span class="pill" id="languagePill">en-IN</span>
          </div>

          <div id="chatLog" class="chat-log"></div>

          <form id="chatForm" class="chat-form">
            <input
              id="chatInput"
              type="text"
              placeholder="Type here or talk to AURA..."
              autocomplete="off"
            />
            <button type="submit" class="primary-button">Send</button>
          </form>

          <div class="interim">
            <span>Live transcript</span>
            <p id="interimText">Waiting for speech...</p>
          </div>
        </section>

        <section class="panel control-panel">
          <div class="panel-head">
            <h2>Control Deck</h2>
            <span class="pill subtle">Owner Only</span>
          </div>

          <div class="stack">
            <label class="field">
              <span>Owner token for mobile / dangerous actions</span>
              <input id="ownerToken" type="password" placeholder="Enter your token" />
            </label>

            <label class="field">
              <span>Preferred language</span>
              <select id="languageSelect"></select>
            </label>

            <div class="quick-grid">
              <button data-command="open chrome and search weather" class="quick-action">
                Open Chrome Search
              </button>
              <button data-command="go to internal storage" class="quick-action">
                Internal Storage
              </button>
              <button data-command="scroll down" class="quick-action">
                Scroll Down
              </button>
              <button data-command="scroll up" class="quick-action">
                Scroll Up
              </button>
              <button data-command="speak with me in tamil" class="quick-action">
                Tamil Mode
              </button>
              <button data-command="lock my computer" class="quick-action">
                Lock PC
              </button>
            </div>
          </div>

          <div class="gesture-box" id="gesturePad">
            <h3>Mobile Gesture Pad</h3>
            <p>Swipe up or down here on your phone to scroll reels.</p>
          </div>

          <div class="voice-studio">
            <div class="panel-head">
              <h2>Voice Studio</h2>
              <span class="pill subtle">Future Ready</span>
            </div>
            <label class="field">
              <span>Voice sample label</span>
              <input id="voiceLabel" type="text" placeholder="Example: My main voice" />
            </label>
            <div class="quick-grid">
              <button id="recordVoice" class="quick-action">Record Voice</button>
              <button id="saveVoice" class="quick-action">Save Voice Sample</button>
            </div>
            <p id="voiceStudioStatus" class="voice-note">
              Save your sample here. Browser speech is still used until a custom TTS engine is connected.
            </p>
            <div id="voiceProfiles" class="voice-profiles"></div>
          </div>
        </section>

        <section class="panel data-panel">
          <div class="panel-head">
            <h2>AI Data</h2>
            <span class="pill subtle">Local First</span>
          </div>
          <pre id="architectureData" class="code-block"></pre>
        </section>

        <section class="panel data-panel">
          <div class="panel-head">
            <h2>Memory & Learning</h2>
            <span class="pill subtle">Editable By You</span>
          </div>
          <pre id="memoryData" class="code-block"></pre>
        </section>

        <section class="panel data-panel">
          <div class="panel-head">
            <h2>Performance</h2>
            <span class="pill subtle">Fast Path</span>
          </div>
          <pre id="performanceData" class="code-block"></pre>
        </section>

        <section class="panel data-panel">
          <div class="panel-head">
            <h2>Private Brain</h2>
            <span class="pill subtle">Owner Only</span>
          </div>
          <pre id="brainData" class="code-block"></pre>
        </section>
      </main>
    </div>

    <script type="module" src="/app.js"></script>
  </body>
</html>

```

## web\styles.css

```css
:root {
  --bg: #07111f;
  --bg-soft: rgba(8, 24, 46, 0.84);
  --panel: rgba(10, 18, 34, 0.8);
  --panel-border: rgba(138, 197, 255, 0.18);
  --line: rgba(149, 210, 255, 0.22);
  --text: #eef7ff;
  --muted: #97b9d4;
  --accent: #4fe3c1;
  --accent-2: #6eb6ff;
  --alert: #ff9e72;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  --radius: 24px;
  --font-display: "Segoe UI Variable Display", "Bahnschrift", "Trebuchet MS", sans-serif;
  --font-body: "Aptos", "Segoe UI", "Tahoma", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: var(--font-body);
  background:
    radial-gradient(circle at top right, rgba(79, 227, 193, 0.16), transparent 30%),
    radial-gradient(circle at top left, rgba(110, 182, 255, 0.18), transparent 26%),
    linear-gradient(135deg, #020910 0%, #08182f 55%, #04101d 100%);
}

button,
input,
select {
  font: inherit;
}

.page-shell {
  width: min(1360px, calc(100% - 28px));
  margin: 0 auto;
  padding: 24px 0 36px;
}

.hero {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  font-size: 0.78rem;
}

.hero h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 5.6rem);
  line-height: 0.9;
}

.hero-copy {
  max-width: 760px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 1.03rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.status-card,
.panel {
  border: 1px solid var(--panel-border);
  background: linear-gradient(180deg, rgba(14, 27, 47, 0.8), rgba(7, 16, 31, 0.9));
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
}

.status-card {
  padding: 18px;
  border-radius: 20px;
}

.status-card span {
  display: block;
  color: var(--muted);
  font-size: 0.84rem;
}

.status-card strong {
  display: block;
  margin-top: 10px;
  font-size: 1.15rem;
}

.dashboard {
  display: grid;
  grid-template-columns: 1.1fr 1.3fr 1fr;
  gap: 18px;
}

.panel {
  border-radius: var(--radius);
  padding: 20px;
}

.avatar-panel,
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.avatar-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 320px;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at center, rgba(79, 227, 193, 0.2), transparent 38%),
    linear-gradient(180deg, rgba(11, 27, 46, 0.55), rgba(8, 15, 27, 0.92));
}

.avatar-core {
  position: relative;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle, rgba(110, 182, 255, 0.45), rgba(79, 227, 193, 0.1));
  box-shadow:
    0 0 40px rgba(110, 182, 255, 0.3),
    inset 0 0 40px rgba(79, 227, 193, 0.15);
}

.avatar-face {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  border: 1px solid rgba(200, 234, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: rgba(3, 15, 29, 0.72);
}

.eye {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #efffff, #79f5dd);
  box-shadow: 0 0 18px rgba(121, 245, 221, 0.7);
  animation: blink 5s infinite;
}

.mouth {
  position: absolute;
  bottom: 30px;
  width: 40px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(110, 182, 255, 0.6), rgba(79, 227, 193, 0.95));
  transform-origin: center;
  transition: transform 180ms ease, height 180ms ease;
}

.avatar-stage.speaking .mouth {
  height: 24px;
  transform: scaleX(1.2);
}

.avatar-stage.listening .avatar-core {
  animation: pulse 1.6s ease-in-out infinite;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(121, 245, 221, 0.16);
}

.ring-a {
  width: 220px;
  height: 220px;
  animation: drift 10s linear infinite;
}

.ring-b {
  width: 280px;
  height: 280px;
  animation: drift 14s linear infinite reverse;
}

.ring-c {
  width: 340px;
  height: 340px;
  animation: drift 20s linear infinite;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-head h2,
.panel-copy h2,
.gesture-box h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.panel-copy p,
.gesture-box p,
.interim p {
  margin: 8px 0 0;
  color: var(--muted);
}

.chat-log {
  display: grid;
  gap: 10px;
  min-height: 340px;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 6px;
}

.message {
  padding: 14px 16px;
  border-radius: 18px;
  line-height: 1.5;
  border: 1px solid var(--line);
}

.message.user {
  background: rgba(79, 227, 193, 0.08);
}

.message.assistant {
  background: rgba(110, 182, 255, 0.12);
}

.message small {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.chat-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-top: 14px;
}

.chat-form input,
.field input,
.field select {
  width: 100%;
  padding: 14px 16px;
  color: var(--text);
  background: rgba(2, 10, 18, 0.78);
  border: 1px solid var(--line);
  border-radius: 16px;
}

.primary-button,
.secondary-button,
.ghost-button,
.quick-action {
  padding: 12px 16px;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
}

.primary-button {
  background: linear-gradient(90deg, var(--accent-2), var(--accent));
  color: #03131b;
  font-weight: 700;
}

.secondary-button {
  background: rgba(110, 182, 255, 0.18);
  color: var(--text);
  border: 1px solid rgba(110, 182, 255, 0.24);
}

.ghost-button,
.quick-action {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  border: 1px solid var(--line);
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover,
.quick-action:hover {
  transform: translateY(-1px);
}

.stack {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span,
.interim span {
  font-size: 0.84rem;
  color: var(--muted);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.gesture-box {
  padding: 18px;
  border-radius: 22px;
  border: 1px dashed rgba(121, 245, 221, 0.35);
  background:
    linear-gradient(180deg, rgba(79, 227, 193, 0.08), rgba(8, 15, 27, 0.55)),
    rgba(255, 255, 255, 0.02);
  min-height: 180px;
}

.gesture-box.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(79, 227, 193, 0.22);
}

.data-panel {
  min-height: 320px;
}

.voice-studio {
  display: grid;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.voice-note {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.voice-profiles {
  display: grid;
  gap: 10px;
}

.voice-profile {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
}

.voice-profile strong,
.voice-profile span {
  display: block;
}

.voice-profile span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.86rem;
}

.voice-profile button {
  margin-top: 10px;
}

.ghost-button.active-brain {
  border-color: rgba(79, 227, 193, 0.5);
}

.code-block {
  margin: 0;
  padding: 18px;
  overflow: auto;
  max-height: 360px;
  border-radius: 18px;
  background: rgba(1, 8, 15, 0.82);
  border: 1px solid rgba(110, 182, 255, 0.14);
  color: #c4e7ff;
  font-family: "Consolas", "Cascadia Code", monospace;
  font-size: 0.88rem;
  line-height: 1.5;
}

.pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(79, 227, 193, 0.12);
  color: var(--accent);
  font-size: 0.78rem;
}

.pill.subtle {
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes drift {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%,
  48%,
  100% {
    transform: scaleY(1);
  }
  49%,
  51% {
    transform: scaleY(0.1);
  }
}

@media (max-width: 1100px) {
  .hero,
  .dashboard {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-shell {
    width: min(100% - 20px, 100%);
    padding-top: 16px;
  }

  .status-grid,
  .quick-grid,
  .chat-form {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 3.3rem;
  }
}

```

## web\app.js

```js
const state = {
  recognition: null,
  recognitionActive: false,
  shouldListen: false,
  speechSupported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  selectedLanguage: "en-IN",
  ownerToken: "",
  voices: [],
  speaking: false,
  gestureStartY: null,
  mediaRecorder: null,
  voiceStream: null,
  recordedChunks: [],
  voiceProfiles: [],
  assistantSettings: null,
  silenceTimer: null,
  idlePresenceTimer: null,
  awaitingReply: false,
  lastUserActivityAt: 0,
  startupGreetingDone: false
};

const ui = {
  statusText: document.querySelector("#statusText"),
  modeText: document.querySelector("#modeText"),
  latencyText: document.querySelector("#latencyText"),
  voiceStatus: document.querySelector("#voiceStatus"),
  languagePill: document.querySelector("#languagePill"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  interimText: document.querySelector("#interimText"),
  listenToggle: document.querySelector("#listenToggle"),
  modeToggle: document.querySelector("#modeToggle"),
  showArchitecture: document.querySelector("#showArchitecture"),
  showMemory: document.querySelector("#showMemory"),
  showPerformance: document.querySelector("#showPerformance"),
  showBrain: document.querySelector("#showBrain"),
  languageSelect: document.querySelector("#languageSelect"),
  ownerToken: document.querySelector("#ownerToken"),
  architectureData: document.querySelector("#architectureData"),
  memoryData: document.querySelector("#memoryData"),
  performanceData: document.querySelector("#performanceData"),
  brainData: document.querySelector("#brainData"),
  avatarStage: document.querySelector("#avatarStage"),
  gesturePad: document.querySelector("#gesturePad"),
  voiceLabel: document.querySelector("#voiceLabel"),
  recordVoice: document.querySelector("#recordVoice"),
  saveVoice: document.querySelector("#saveVoice"),
  voiceProfiles: document.querySelector("#voiceProfiles"),
  voiceStudioStatus: document.querySelector("#voiceStudioStatus")
};

boot().catch((error) => {
  appendMessage("assistant", `Boot error: ${error.message}`);
});

async function boot() {
  bindUi();
  await Promise.allSettled([
    loadLanguages(),
    refreshArchitecture(),
    refreshMemory(),
    refreshPerformance(),
    refreshVoiceProfiles(),
    refreshBrain(),
    refreshState()
  ]);
  connectEventStream();
  hydrateVoices();
  initializeSpeechRecognition();
  await attemptAutoStartListening();
  await attemptStartupGreeting();
  scheduleIdlePresencePrompt();
}

function bindUi() {
  ui.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = ui.chatInput.value.trim();
    if (!text) {
      return;
    }

    ui.chatInput.value = "";
    noteUserActivity();
    await talkToAura(text, "text");
  });

  ui.listenToggle.addEventListener("click", async () => {
    if (!state.speechSupported) {
      ui.voiceStatus.textContent =
        "This browser does not support SpeechRecognition. Use Chrome or Edge.";
      return;
    }

    if (state.shouldListen) {
      stopListening();
      await updatePreferences({ alwaysListen: false });
      return;
    }

    state.shouldListen = true;
    await updatePreferences({ alwaysListen: true });
    startListening();
  });

  ui.modeToggle.addEventListener("click", async () => {
    const nextMode = ui.modeToggle.dataset.onlinePreferred !== "false";
    await postJson("/api/runtime", { onlinePreferred: !nextMode });
  });

  ui.showArchitecture.addEventListener("click", refreshArchitecture);
  ui.showMemory.addEventListener("click", refreshMemory);
  ui.showPerformance.addEventListener("click", refreshPerformance);
  ui.showBrain.addEventListener("click", refreshBrain);

  ui.ownerToken.addEventListener("input", (event) => {
    state.ownerToken = event.target.value.trim();
    if (state.ownerToken) {
      refreshPrivatePanels();
    }
  });

  ui.languageSelect.addEventListener("change", async (event) => {
    const languageId = event.target.value;
    state.selectedLanguage = languageId;
    await updatePreferences({
      inputLanguage: languageId,
      replyLanguage: languageId
    });
    if (state.recognition) {
      state.recognition.lang = languageId === "ta-IN-x-tanglish" ? "ta-IN" : languageId;
    }
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", async () => {
      await talkToAura(button.dataset.command, "button");
    });
  });

  ui.gesturePad.addEventListener("touchstart", (event) => {
    state.gestureStartY = event.touches[0]?.clientY ?? null;
    ui.gesturePad.classList.add("active");
  });

  ui.gesturePad.addEventListener("touchend", async (event) => {
    const endY = event.changedTouches[0]?.clientY ?? null;
    if (state.gestureStartY !== null && endY !== null) {
      const delta = endY - state.gestureStartY;
      if (Math.abs(delta) > 30) {
        await talkToAura(delta > 0 ? "scroll down" : "scroll up", "gesture");
      }
    }
    state.gestureStartY = null;
    ui.gesturePad.classList.remove("active");
  });

  ui.recordVoice.addEventListener("click", toggleVoiceRecording);
  ui.saveVoice.addEventListener("click", saveVoiceSample);
}

async function refreshState() {
  const data = await fetchJson("/api/state");
  renderState(data);
}

async function refreshArchitecture() {
  await runPrivateRefresh(ui.architectureData, "/api/architecture");
}

async function refreshMemory() {
  await runPrivateRefresh(ui.memoryData, "/api/memory");
}

async function refreshPerformance() {
  await runPrivateRefresh(ui.performanceData, "/api/performance");
}

async function refreshVoiceProfiles() {
  try {
    const data = await fetchJson("/api/voice-profiles");
    state.voiceProfiles = data.items ?? [];
    renderVoiceProfiles(data);
  } catch (error) {
    state.voiceProfiles = [];
    ui.voiceProfiles.innerHTML =
      "<p class='voice-note'>Enter your owner token to view saved voice profiles from another device.</p>";
  }
}

async function refreshBrain() {
  try {
    const data = await fetchJson("/api/brain");
    ui.brainData.textContent = JSON.stringify(data, null, 2);
    ui.showBrain.classList.add("active-brain");
  } catch (error) {
    ui.brainData.textContent =
      "Private brain view is protected. Open locally on your laptop or enter your owner token.";
    ui.showBrain.classList.remove("active-brain");
  }
}

async function loadLanguages() {
  const payload = await fetchJson("/api/languages");
  const fragment = document.createDocumentFragment();

  payload.languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.id;
    option.textContent = language.label;
    fragment.appendChild(option);
  });

  ui.languageSelect.innerHTML = "";
  ui.languageSelect.appendChild(fragment);
}

function connectEventStream() {
  const events = new EventSource("/api/events");
  events.onmessage = async (event) => {
    const payload = JSON.parse(event.data);
    renderState(payload);
    ui.memoryData.textContent = JSON.stringify(
      {
        preferences: payload.preferences,
        learning: payload.learning
      },
      null,
      2
    );
    ui.performanceData.textContent = JSON.stringify(payload.performance, null, 2);
    renderVoiceProfiles(payload.voiceProfiles);
  };
}

function renderState(payload) {
  const publicState = payload.state;
  state.selectedLanguage = publicState.inputLanguage;
  state.assistantSettings = payload.assistantSettings ?? null;
  state.shouldListen = Boolean(publicState.listening);
  state.awaitingReply = Boolean(publicState.awaitingReply);

  ui.statusText.textContent = publicState.listening ? "Listening" : "Idle";
  ui.modeText.textContent = publicState.onlinePreferred
    ? "Online Preferred"
    : "Offline Preferred";
  ui.modeToggle.dataset.onlinePreferred = String(publicState.onlinePreferred);
  ui.modeToggle.textContent = publicState.onlinePreferred
    ? "Switch To Offline"
    : "Switch To Online";
  ui.latencyText.textContent = `${publicState.lastLatencyMs ?? 0} ms`;
  ui.languagePill.textContent = publicState.replyLanguage;
  ui.languageSelect.value = publicState.replyLanguage;
  ui.listenToggle.textContent = publicState.listening ? "Stop Listening" : "Start Listening";
  ui.voiceStatus.textContent = publicState.speaking
    ? "AURA is speaking."
    : publicState.listening
      ? "AURA is actively listening with no wake word."
      : "Listening is paused.";
  ui.avatarStage.classList.toggle("listening", Boolean(publicState.listening));
  ui.avatarStage.classList.toggle("speaking", Boolean(publicState.speaking));
}

async function talkToAura(text, source) {
  appendMessage("user", text);
  clearSilenceFollowUp();
  clearIdlePresencePrompt();
  ui.interimText.textContent = "Sending to AURA...";
  const payload = await postJson("/api/talk", { text, source });
  appendMessage("assistant", payload.replyText);

  if (payload.data) {
    const json = JSON.stringify(payload.data, null, 2);
    if (payload.action === "show-architecture") {
      ui.architectureData.textContent = json;
    }
    if (payload.action === "show-memory") {
      ui.memoryData.textContent = json;
    }
    if (payload.action === "show-brain" || payload.action === "show-default-commands" || payload.action === "show-manual-responses") {
      ui.brainData.textContent = json;
    }
    if (payload.action === "show-performance") {
      ui.performanceData.textContent = json;
    }
  }

  ui.interimText.textContent = "Waiting for speech...";
  await refreshMemory();
  await refreshPerformance();
  await refreshVoiceProfiles();
  await refreshBrain();
  await speak(payload.replyText);
  scheduleSilenceFollowUp(payload.conversationState);
  scheduleIdlePresencePrompt();
}

function appendMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  article.innerHTML = `<small>${role === "user" ? "You" : "AURA"}</small>${escapeHtml(text)}`;
  ui.chatLog.prepend(article);
}

function hydrateVoices() {
  const loadVoices = () => {
    state.voices = window.speechSynthesis.getVoices();
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function renderVoiceProfiles(payload) {
  const items = payload?.items ?? [];
  const activeVoiceProfileId = payload?.activeVoiceProfileId ?? null;
  ui.voiceProfiles.innerHTML = "";

  if (items.length === 0) {
    ui.voiceProfiles.innerHTML =
      "<p class='voice-note'>No stored custom voice sample yet. Record one below.</p>";
    return;
  }

  items.forEach((voiceProfile) => {
    const article = document.createElement("article");
    article.className = "voice-profile";
    const isActive = voiceProfile.id === activeVoiceProfileId;
    article.innerHTML = `
      <strong>${escapeHtml(voiceProfile.label)}</strong>
      <span>${escapeHtml(voiceProfile.fileName)}</span>
      <span>${isActive ? "Active sample" : "Stored sample"}</span>
    `;

    if (!isActive) {
      const button = document.createElement("button");
      button.className = "quick-action";
      button.textContent = "Use This Voice Sample";
      button.addEventListener("click", async () => {
        await postJson("/api/voice-profiles/activate", {
          voiceProfileId: voiceProfile.id
        });
        ui.voiceStudioStatus.textContent =
          "Voice sample changed. Browser speech is still active unless you connect custom TTS.";
        await refreshVoiceProfiles();
      });
      article.appendChild(button);
    }

    ui.voiceProfiles.appendChild(article);
  });
}

async function attemptAutoStartListening() {
  if (!state.speechSupported || !state.assistantSettings?.modes?.autoStartListeningOnLoad) {
    return;
  }

  if (!state.assistantSettings.modes.alwaysListen) {
    return;
  }

  try {
    startListening();
  } catch (error) {
    ui.voiceStatus.textContent =
      "Auto-start is ready, but this browser wants one click before microphone listening begins.";
  }
}

async function attemptStartupGreeting() {
  if (!state.assistantSettings?.modes?.startupGreetingEnabled) {
    return;
  }

  if (sessionStorage.getItem("aura-startup-greeting") === "done") {
    return;
  }

  try {
    const payload = await postJson("/api/presence-prompt", {
      reason: "startup-greeting"
    });
    appendMessage("assistant", payload.replyText);
    await refreshMemory();
    await refreshBrain();
    await speak(payload.replyText);
    sessionStorage.setItem("aura-startup-greeting", "done");
    state.startupGreetingDone = true;
  } catch (error) {
    ui.voiceStatus.textContent = `Startup greeting error: ${error.message}`;
  }
}

function initializeSpeechRecognition() {
  if (!state.speechSupported) {
    ui.voiceStatus.textContent =
      "SpeechRecognition is not available here. Use Chrome or Edge for no-wake voice mode.";
    return;
  }

  const RecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new RecognitionClass();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;

  recognition.onresult = async (event) => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        continue;
      }

      if (result.isFinal) {
        noteUserActivity();
        ui.interimText.textContent = transcript;
        await talkToAura(transcript, "voice");
      } else {
        interimText = transcript;
      }
    }

    if (interimText) {
      ui.interimText.textContent = interimText;
    }
  };

  recognition.onerror = (event) => {
    ui.voiceStatus.textContent = `Voice error: ${event.error}`;
  };

  recognition.onend = () => {
    state.recognitionActive = false;
    if (state.shouldListen && !state.speaking) {
      window.setTimeout(() => {
        startListening();
      }, 250);
    }
  };

  state.recognition = recognition;
}

function startListening() {
  if (!state.recognition || state.recognitionActive) {
    return;
  }

  state.shouldListen = true;
  state.recognition.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;
  try {
    state.recognition.start();
    state.recognitionActive = true;
  } catch (error) {
    ui.voiceStatus.textContent =
      "Microphone start was blocked by the browser. Click Start Listening once and AURA will stay wake-word free after that.";
  }
}

function stopListening() {
  if (state.recognition && state.recognitionActive) {
    state.recognition.stop();
  }
  state.recognitionActive = false;
}

async function speak(text) {
  if (!("speechSynthesis" in window) || !text) {
    return;
  }

  state.speaking = true;
  stopListening();
  await postJson("/api/runtime", { speaking: true });

  await new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;
    utterance.rate = state.assistantSettings?.voices?.rate ?? 1;
    utterance.pitch = state.assistantSettings?.voices?.pitch ?? 1;
    utterance.volume = state.assistantSettings?.voices?.volume ?? 1;

    const preferredNames = state.assistantSettings?.voices?.preferredVoiceNames ?? [];
    const matchingVoice =
      state.voices.find((voice) => preferredNames.includes(voice.name)) ??
      state.voices.find((voice) => voice.lang === utterance.lang) ??
      state.voices.find((voice) => voice.lang.startsWith(utterance.lang.split("-")[0])) ??
      null;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });

  state.speaking = false;
  await postJson("/api/runtime", { speaking: false });
  if (state.shouldListen) {
    startListening();
  }
}

function scheduleSilenceFollowUp(conversationState) {
  clearSilenceFollowUp();

  if (!conversationState?.allowSilenceFollowUp) {
    state.awaitingReply = false;
    return;
  }

  state.awaitingReply = true;
  const delayMs =
    conversationState.followUpDelayMs ??
    state.assistantSettings?.modes?.proactiveFollowUpMs ??
    16000;

  state.silenceTimer = window.setTimeout(async () => {
    if (!state.awaitingReply) {
      return;
    }

    const silenceMs = Date.now() - state.lastUserActivityAt;
    if (silenceMs < delayMs - 500) {
      return;
    }

    try {
      const payload = await postJson("/api/proactive-follow-up", {});
      appendMessage("assistant", payload.replyText);
      await refreshMemory();
      await refreshPerformance();
      await refreshBrain();
      await speak(payload.replyText);
    } catch (error) {
      ui.voiceStatus.textContent = `Follow-up error: ${error.message}`;
    } finally {
      state.awaitingReply = false;
      clearSilenceFollowUp();
    }
  }, delayMs);
}

function clearSilenceFollowUp() {
  if (state.silenceTimer) {
    window.clearTimeout(state.silenceTimer);
    state.silenceTimer = null;
  }
}

function scheduleIdlePresencePrompt() {
  clearIdlePresencePrompt();

  if (!state.assistantSettings?.modes?.idlePresenceEnabled) {
    return;
  }

  const idleMs = state.assistantSettings.modes.idlePresenceMs ?? 300000;
  state.idlePresenceTimer = window.setTimeout(async () => {
    try {
      const payload = await postJson("/api/presence-prompt", {
        reason: "idle-help"
      });
      appendMessage("assistant", payload.replyText);
      await refreshMemory();
      await refreshBrain();
      await speak(payload.replyText);
    } catch (error) {
      ui.voiceStatus.textContent = `Idle prompt error: ${error.message}`;
    } finally {
      clearIdlePresencePrompt();
    }
  }, idleMs);
}

function clearIdlePresencePrompt() {
  if (state.idlePresenceTimer) {
    window.clearTimeout(state.idlePresenceTimer);
    state.idlePresenceTimer = null;
  }
}

function noteUserActivity() {
  state.lastUserActivityAt = Date.now();
  state.awaitingReply = false;
  clearSilenceFollowUp();
  clearIdlePresencePrompt();
}

async function toggleVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    ui.voiceStudioStatus.textContent =
      "This browser does not support voice recording here.";
    return;
  }

  if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
    state.mediaRecorder.stop();
    ui.recordVoice.textContent = "Record Voice";
    ui.voiceStudioStatus.textContent = "Recording stopped. Save the sample if it sounds good.";
    return;
  }

  state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  state.recordedChunks = [];
  state.mediaRecorder = new MediaRecorder(state.voiceStream);
  state.mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      state.recordedChunks.push(event.data);
    }
  };
  state.mediaRecorder.onstop = () => {
    state.voiceStream?.getTracks().forEach((track) => track.stop());
  };
  state.mediaRecorder.start();
  ui.recordVoice.textContent = "Stop Recording";
  ui.voiceStudioStatus.textContent = "Recording your voice sample now. Speak clearly for 5 to 10 seconds.";
}

async function saveVoiceSample() {
  if (state.recordedChunks.length === 0) {
    ui.voiceStudioStatus.textContent = "Record a voice sample first.";
    return;
  }

  const blob = new Blob(state.recordedChunks, { type: "audio/webm" });
  const base64Audio = await blobToBase64(blob);
  const label = ui.voiceLabel.value.trim() || "My Voice";

  const payload = await postJson("/api/voice-profiles", {
    label,
    mimeType: blob.type || "audio/webm",
    base64Audio
  });

  ui.voiceStudioStatus.textContent = payload.message;
  state.recordedChunks = [];
  ui.voiceLabel.value = "";
  await refreshVoiceProfiles();
}

async function updatePreferences(patch) {
  await postJson("/api/preferences", patch);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: buildAuthHeaders(false)
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(true)
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

async function runPrivateRefresh(target, url) {
  try {
    const data = await fetchJson(url);
    target.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    target.textContent =
      "Private owner-only data is hidden here. Open the dashboard on your laptop or enter your owner token.";
  }
}

async function refreshPrivatePanels() {
  await Promise.allSettled([
    refreshArchitecture(),
    refreshMemory(),
    refreshPerformance(),
    refreshVoiceProfiles(),
    refreshBrain()
  ]);
}

function buildAuthHeaders(includeJsonContentType) {
  return {
    ...(includeJsonContentType ? {} : {}),
    ...(state.ownerToken ? { "X-Aura-Owner-Token": state.ownerToken } : {})
  };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

```

## README.md

```md
# AURA

AURA is a local-first personal AI assistant starter kit for Windows laptops. It gives you:

- always-listening voice input in the browser with no wake word
- automatic listening startup when the dashboard loads, if the browser allows microphone reuse
- online chat with OpenAI and offline chat with Ollama
- local memory and behavior tracking stored in your own `data/aura.db.json`
- private owner-only brain transparency so you can inspect stored memories, events, and routines
- browser and system automation through controlled Windows commands
- a mobile-friendly control panel with gesture support for scrolling
- multilingual replies including English, Tamil, and Tanglish-friendly usage

## Quick Start

1. Open the folder in VS Code.
2. Review and edit `config.local.json`.
3. Start the server:

```powershell
node src/index.js
```

Or just run:

```bat
start-aura.cmd
```

4. Open [http://localhost:4545](http://localhost:4545).
5. Allow microphone permission in Chrome or Edge.
6. Press `Start Listening`.

## What AURA Can Do In This Starter

- talk with you naturally through a browser dashboard
- open Chrome and search the web
- open your internal storage in File Explorer
- scroll the active window up or down
- lock your computer
- show its own memory, learning summary, storage layout, and model architecture
- show its full private brain data for the owner
- switch language by command such as `speak with me in tamil`
- ask a natural follow-up if it asked you something and you stay silent for a while

## What Is Still A Controlled Starter

- no-wake continuous listening is built, but true desktop-level background listening outside the browser would need a native audio pipeline
- powerful commands like `shutdown` are disabled by default for safety
- daily learning is memory/routine tracking, not full retraining of giant neural networks
- browser speech recognition quality depends on the browser and microphone

## File Structure

```text
New project/
â”œâ”€ config.example.json
â”œâ”€ config.local.json
â”œâ”€ package.json
â”œâ”€ README.md
â”œâ”€ data/
â”‚  â””â”€ aura.db.json
â”œâ”€ docs/
â”‚  â”œâ”€ ARCHITECTURE.md
â”‚  â”œâ”€ COMMAND_EXAMPLES.md
â”‚  â”œâ”€ INSTALL_WINDOWS.md
â”‚  â””â”€ TROUBLESHOOTING.md
â”œâ”€ src/
â”‚  â”œâ”€ api/
â”‚  â”‚  â””â”€ server.js
â”‚  â”œâ”€ config/
â”‚  â”‚  â”œâ”€ languages.js
â”‚  â”‚  â””â”€ loadConfig.js
â”‚  â”œâ”€ core/
â”‚  â”‚  â”œâ”€ auraEngine.js
â”‚  â”‚  â””â”€ promptBuilder.js
â”‚  â”œâ”€ services/
â”‚  â”‚  â”œâ”€ automation/
â”‚  â”‚  â”‚  â”œâ”€ browserActions.js
â”‚  â”‚  â”‚  â”œâ”€ commandRouter.js
â”‚  â”‚  â”‚  â”œâ”€ powershellBridge.js
â”‚  â”‚  â”‚  â””â”€ systemActions.js
â”‚  â”‚  â”œâ”€ cloud/
â”‚  â”‚  â”‚  â””â”€ supabaseSync.js
â”‚  â”‚  â”œâ”€ learning/
â”‚  â”‚  â”‚  â””â”€ behaviorTracker.js
â”‚  â”‚  â”œâ”€ llm/
â”‚  â”‚  â”‚  â”œâ”€ ollamaClient.js
â”‚  â”‚  â”‚  â””â”€ openaiClient.js
â”‚  â”‚  â””â”€ memory/
â”‚  â”‚     â””â”€ localDatabase.js
â”‚  â”œâ”€ utils/
â”‚  â”‚  â”œâ”€ jsonFile.js
â”‚  â”‚  â””â”€ logger.js
â”‚  â””â”€ index.js
â””â”€ web/
   â”œâ”€ app.js
   â”œâ”€ index.html
   â””â”€ styles.css
```

## Main Files

- `src/index.js`: boots the server and wires all services together
- `src/core/auraEngine.js`: central orchestration for commands, chat routing, memory, and state
- `src/api/server.js`: HTTP API plus static dashboard serving
- `src/services/automation/*`: Windows actions like browser control and locking the PC
- `src/services/llm/*`: online OpenAI adapter and offline Ollama adapter
- `src/services/memory/localDatabase.js`: local-first memory store
- `web/app.js`: voice loop, UI controls, gestures, and speech synthesis

## Important Safety Note

If you want commands like shutdown and restart, change this in `config.local.json`:

```json
"allowDangerousSystemActions": true
```

Only do this if you fully trust the device, microphone environment, and owner token setup.

```

## docs\ARCHITECTURE.md

```md
# AURA Architecture

## 1. Core Idea

AURA is not training a new giant neural network on your laptop. That would be too slow, too expensive, and not practical for daily use on a normal system.

Instead, AURA combines:

1. Pre-trained neural models for reasoning and language.
2. Speech-to-text and text-to-speech layers.
3. A local memory database that stores your activity and preferences.
4. Lightweight behavior learning that tracks your routines.
5. An automation layer that executes allowed system actions.

That is the practical way to build a fast personal assistant.

## 2. Neural Network Layer

### Online mode

- Provider: OpenAI
- Purpose: strong reasoning, better multilingual responses, better emotional tone
- Config source: `config.local.json -> models.online`

### Offline mode

- Provider: Ollama
- Purpose: local responses when internet is unavailable
- Config source: `config.local.json -> models.offline`

## 3. Speech Layer

### Input

- Default: browser `SpeechRecognition`
- Why: easiest free setup, no extra packages, fast to test
- Limitation: depends on browser support and may use cloud-backed recognition

### Output

- Default: browser `SpeechSynthesis`
- Why: free, already available on Windows browsers, supports many voices

## 4. Data Layer

Local storage file:

- [aura.db.json](/C:/Users/ADMIN/Documents/New%20project/data/aura.db.json)

Main collections:

- `preferences`: language, always-listen mode, safety settings
- `profile`: favorite apps, sites, style hints
- `memories`: conversation memory and tagged facts
- `events`: every command, voice event, and chat event
- `routines`: repeated actions that AURA learns over time

## 5. Cloud Layer

Optional free cloud sync:

- Provider: Supabase
- File: [supabaseSync.js](/C:/Users/ADMIN/Documents/New%20project/src/services/cloud/supabaseSync.js)
- Mode: disabled by default

Recommended use:

1. Create a free Supabase project.
2. Create one table called `aura_sync`.
3. Keep the API key only on the backend in `config.local.json`.

## 6. Command Flow

1. Browser hears speech.
2. Transcript is sent to `/api/talk`.
3. `commandRouter.js` checks whether it is a direct action.
4. If it is a command, the automation layer runs it.
5. If it is conversation, AURA builds a prompt with memory.
6. AURA tries online model first if enabled.
7. If online is unavailable, AURA falls back to Ollama.
8. Result is saved into memory and shown in the dashboard.

## 7. Learning Flow

Learning in this starter means:

- tracking what commands you use often
- remembering conversations and preferences
- building routine frequency summaries
- improving future responses with memory context

Learning in this starter does not mean:

- retraining OpenAI models
- retraining Llama weights on your laptop every day
- changing neural weights inside the model itself

That kind of training is much heavier than what most personal laptops can do for a daily assistant.

```

## docs\COMMAND_EXAMPLES.md

```md
# Command Examples

## Browser

- `open chrome and search latest AI news`
- `search weather in chrome`
- `open youtube.com`
- `go to internal storage`

## Scrolling

- `scroll down`
- `scroll up`
- `next reel`
- `previous reel`

## Language

- `speak with me in tamil`
- `change language to tanglish`
- `speak with me in english`

## Data

- `show ai data`
- `show memory`
- `show database`

## System

- `lock my computer`
- `shutdown my computer`
- `restart my computer`

Remember:

- shutdown and restart are blocked until you explicitly enable dangerous actions

```

## docs\DEFAULT_COMMANDS.md

```md
# AURA Default Commands

These are the built-in commands AURA knows by default.

## Transparency

- `show my ai brain`
- `show what is stored in your brain`
- `show all stored data`
- `show memory`
- `show performance`
- `show ai data`
- `show default commands`
- `show manual responses`

## Listening

- `pause listening`
- `resume listening`
- `start listening`
- `stop listening`

## Browser

- `open chrome and search weather`
- `search latest ai news in chrome`
- `open youtube.com`
- `go to internal storage`
- `open downloads folder`
- `open videos folder`
- `open documents folder`
- `open desktop folder`
- `open video trailer`
- `play video demo`

## Scrolling

- `scroll down`
- `scroll up`
- `next reel`
- `previous reel`

## Language

- `speak with me in tamil`
- `change language to english`
- `change language to tanglish`

## Memory

- `my name is Arun`
- `what is my name`
- `what is our owner name`

## Tasks

- `add task call electrician`
- `assign task finish project report`
- `show my tasks`
- `list tasks`
- `complete task call electrician`

## Important Note

AURA is wake-word free inside the dashboard when always-listening is active. Some browsers still require one initial click to grant microphone access.

```

## docs\DEPLOY_ON_LAPTOP.md

```md
# Deploy AURA On Your Laptop

## What "Deploy" Means Here

For this project, local deployment means:

1. Your AURA backend runs on your laptop with Node.js.
2. Your dashboard opens in your browser at `http://localhost:4545`.
3. Your memory database stays on your laptop in `data/aura.db.json`.
4. Your voice samples stay on your laptop in `data/voice-samples/`.

This is a local-first deployment, not a cloud hosting deployment.

## Files Used For Deployment

- `deploy-aura-local.cmd`
  - Starts the AURA server in a new terminal.
  - Opens the dashboard in your browser.

- `start-aura.cmd`
  - Simple server start script.

- `open-aura-dashboard.cmd`
  - Opens the browser to the dashboard.

- `view-aura-database.cmd`
  - Opens the database JSON in Notepad.

## Step 1. Open The Project

Open this folder in VS Code:

- `C:\Users\ADMIN\Documents\New project`

## Step 2. Edit Your Main Config

Open:

- `config.local.json`

Update these fields:

1. `ownerName`
2. `auth.ownerToken`
3. `persona.addressUserAs`
4. `models.online.apiKey` if you want OpenAI online reasoning
5. `modes.alwaysListen`
6. `modes.autoStartListeningOnLoad`
7. `modes.ownerOnlyTransparency`
8. `modes.startupGreetingEnabled`
9. `modes.idlePresenceEnabled`

If you want AURA to answer:

- `what is our owner name`

with:

- `His name is Vickey.`

then set:

```json
"ownerName": "Vickey"
```

Recommended values:

```json
"alwaysListen": true,
"autoStartListeningOnLoad": true,
"ownerOnlyTransparency": true,
"startupGreetingEnabled": true,
"startupGreetingText": "AURA is working for you.",
"proactiveFollowUpMs": 16000,
"idlePresenceEnabled": true,
"idlePresenceMs": 300000
```

## Step 3. Start Local Deployment

Fastest method:

1. Double-click `deploy-aura-local.cmd`

Manual method:

1. Open VS Code terminal
2. Run:

```powershell
node src/index.js
```

3. Open:

```text
http://localhost:4545
```

## Step 4. Allow Microphone

When the browser opens:

1. Allow microphone access
2. If auto-start listening works, AURA starts without a wake word
3. If the browser blocks auto microphone startup, click `Start Listening` once

Important:

- After browser permission is granted, AURA stays wake-word free inside the dashboard
- Some browsers still require the first permission click for security reasons

## Step 5. Test AURA

Try these commands:

- `my name is Rahul`
- `what is my name`
- `what is our owner name`
- `show my ai brain`
- `show memory`
- `show performance`
- `open chrome and search weather`
- `open downloads folder`
- `open videos folder`
- `open video trailer`
- `add task call electrician`
- `show my tasks`
- `scroll down`
- `pause listening`
- `resume listening`

## Step 6. See What Is Stored

### Method A: Dashboard

Use these buttons:

- `Show Brain`
- `Show Memory`
- `Show Performance`

### Method B: Open The Raw Database File

Run:

- `view-aura-database.cmd`

Or open directly:

- `data/aura.db.json`

## How The Database Is Connected

The backend does not use MySQL or Postgres by default.

It uses:

- local JSON file storage

Main connection path:

1. `src/index.js`
   - loads config
   - creates `LocalDatabase`
2. `src/services/memory/localDatabase.js`
   - reads and writes `data/aura.db.json`
3. `src/core/auraEngine.js`
   - sends memory facts, events, routines, and profile updates into the database
4. `src/api/server.js`
   - exposes database-backed API routes like `/api/memory` and `/api/brain`

Database path:

- `config.local.json -> storage.localDbPath`
- manual response path: `config.local.json -> storage.manualResponsesPath`

Current default:

```json
"localDbPath": "./data/aura.db.json"
```

## What Is Stored In The Database

Inside `data/aura.db.json`, these sections are stored:

- `meta`
  - assistant and owner metadata

- `preferences`
  - language, always-listen, safety, browser automation settings

- `profile`
  - your saved name
  - aliases
  - voice profiles
  - language habits
  - app and website habits

- `memories`
  - saved facts
  - conversation summaries
  - assistant follow-up messages

- `events`
  - voice input events
  - command events
  - conversation events
  - proactive follow-up events

- `routines`
  - frequently used actions

## API Functions You Can Use

Important backend routes:

- `/api/state`
  - current assistant state

- `/api/talk`
  - send text to AURA

- `/api/memory`
  - see stored learning and memory

- `/api/brain`
  - private full transparency view

- `/api/performance`
  - speed and latency report

- `/api/default-commands`
  - built-in command list

- `/api/presence-prompt`
  - startup greeting and idle help prompt

- `/api/voice-profiles`
  - saved voice sample metadata

## If You Want Online + Offline Together

### Online

Set:

- `models.online.apiKey`

Then AURA can use OpenAI.

### Offline

Install Ollama and pull a model:

```powershell
ollama pull llama3.1:8b
```

Then keep:

```json
"offline": {
  "provider": "ollama",
  "baseUrl": "http://127.0.0.1:11434",
  "model": "llama3.1:8b"
}
```

## How To Stop AURA

If you started with:

- `deploy-aura-local.cmd`

close the terminal window named `AURA Server`.

If you started in VS Code terminal:

- press `Ctrl + C`

## Optional Next Step

If you want AURA to start automatically when Windows starts, see:

- `docs/ENABLE_WINDOWS_STARTUP.md`

## GPT And Cloud Connections

### OpenAI GPT Connection

Open:

- `config.local.json`

Set:

```json
"online": {
  "provider": "openai",
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "YOUR_OPENAI_KEY",
  "model": "gpt-5.4-mini",
  "apiMode": "chat_completions"
}
```

Why this helps:

- stronger reasoning
- better human-style replies
- better multilingual understanding

### Free Cloud Sync

Set the Supabase section in `config.local.json` and turn on:

```json
"cloudSync": true
```

This lets AURA sync selected interaction records to your free cloud project while still keeping the main laptop database local.

```

## docs\ENABLE_WINDOWS_STARTUP.md

```md
# Enable AURA On Windows Startup

If you want AURA to open automatically when your laptop starts:

## Option 1. Automatic Startup Shortcut

Run this script in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-aura-startup.ps1
```

What it does:

- creates a shortcut in your Windows Startup folder
- launches `deploy-aura-local.cmd` after login
- AURA then opens the dashboard and can say `AURA is working for you, master`

## Option 2. Manual Startup Shortcut

1. Press `Win + R`
2. Type:

```text
shell:startup
```

3. Press Enter
4. Create a shortcut there pointing to:

```text
C:\Users\ADMIN\Documents\New project\deploy-aura-local.cmd
```

## Important Notes

- Node.js must already be installed
- your browser must still allow microphone access
- some browsers require one first click before fully hands-free listening works

```

## docs\FILE_USAGE_AND_FUTURE_DEV.md

```md
# File Usage And Future Development

## Main Backend Files

- `src/index.js`
  - App entry point.
  - Starts AURA server.
  - Connects config, database, learning, performance, online AI, and offline AI.

- `src/api/server.js`
  - Backend HTTP server.
  - Exposes APIs like `/api/talk`, `/api/memory`, `/api/performance`, `/api/voice-profiles`.
  - Handles browser dashboard requests.

- `src/core/auraEngine.js`
  - Main brain/orchestrator.
  - Decides whether text is a command, a stored-memory question, or normal AI chat.
  - Tracks response latency and provider selection.
  - Creates proactive follow-up prompts when the user goes silent after a question.

- `src/core/promptBuilder.js`
  - Builds the AI prompt with memory, routines, and personal facts.
  - Important for future prompt engineering.

- `src/config/engineProfile.js`
  - Defines the human-style engine behavior.
  - Contains tone rules, cognition layers, and proactive silence follow-up phrases.

## Memory And Database Files

- `data/aura.db.json`
  - Main local database.
  - Stores your facts, memories, events, routines, and voice profile metadata.
  - This is the file that remembers your name across months.

- `src/services/memory/localDatabase.js`
  - Database engine for `aura.db.json`.
  - Handles read, write, fact updates, voice profile metadata, and learning summaries.

- `src/services/learning/personalFacts.js`
  - Extracts facts like `my name is Arun`.
  - Answers memory questions like `what is my name`.

- `src/services/learning/behaviorTracker.js`
  - Stores behavior data from daily use.
  - Learns frequent apps, language habits, and routine actions.

- `src/config/defaultCommands.js`
  - Central registry of AURA default commands.
  - Good file to edit when you want to add new built-in actions or spoken phrases.

## Performance Files

- `src/services/analytics/performanceReporter.js`
  - Computes average latency, p95 latency, provider counts, and command success rate.
  - Best file to extend if you want speed dashboards, token tracking, or benchmark logs.

## AI Model Files

- `src/services/llm/openaiClient.js`
  - Online AI connector.
  - Use this for stronger reasoning, better multilingual replies, and future OpenAI improvements.

- `src/services/llm/ollamaClient.js`
  - Offline AI connector.
  - Use this for local/private chat when internet is not available.

## Voice Files

- `web/app.js`
  - Frontend voice loop.
  - Microphone input, browser speech output, voice sample recording, gesture support.
  - Auto-start listening logic and silence follow-up scheduling live here.

- `data/voice-samples/`
  - Stores your uploaded or recorded voice samples.
  - AURA can switch the active sample later.

Important note:

- Right now, the project stores your voice sample and voice metadata.
- True voice cloning still needs a separate TTS engine.
- Best future file to extend for that: `src/api/server.js` plus a new `src/services/voice/customTtsClient.js`.

## Frontend Files

- `web/index.html`
  - Dashboard layout.
  - Add new panels here, including the private brain panel.

- `web/styles.css`
  - Dashboard design and mobile responsiveness.
  - Update this for avatar improvements and richer control-room visuals.

## Config Files

- `config.local.json`
  - Your real runtime config.
  - Set API keys, owner token, model settings, and voice mode here.

- `config.example.json`
  - Clean template for sharing or recreating the project.

## Best Future Development Order

1. Improve memory in `personalFacts.js` and `localDatabase.js`
2. Improve speed in `performanceReporter.js` and `auraEngine.js`
3. Add custom TTS engine integration
4. Add desktop tray app / native background listening
5. Add scheduler, reminders, and browser tab automation

```

## docs\FUNCTIONS_AND_APIS.md

```md
# AURA Functions And APIs

## Main Runtime Flow

### `src/index.js`

Purpose:

- boot the whole assistant

Main work:

1. load config
2. connect local database
3. create learning/performance services
4. create online and offline AI clients
5. create AURA engine
6. start API server

## Core Brain Functions

### `src/core/auraEngine.js`

Main functions:

- `processUserText(...)`
  - main entry for user input
  - handles memory, commands, and chat

- `executeCommand(...)`
  - runs command actions like browser/search/scroll/brain views

- `handlePersonalMemory(...)`
  - stores and recalls facts like your name

- `getBrainSnapshot()`
  - returns the full owner transparency object

- `getPerformanceReport()`
  - returns response speed and engine stats

- `createProactiveFollowUp()`
  - asks again when you stay silent

- `createPresencePrompt()`
  - creates startup greeting and 5-minute idle help prompt

## Database Functions

### `src/services/memory/localDatabase.js`

Main functions:

- `init()`
  - creates/loads database structure

- `getSnapshot()`
  - returns the whole database object

- `getPreferences()`
  - returns current preferences

- `getProfile()`
  - returns your saved identity/profile data

- `upsertProfileFact(...)`
  - stores facts like name

- `addMemory(...)`
  - stores memory entries

- `addEvent(...)`
  - stores activity and system events

- `recordRoutine(...)`
  - updates repeated action usage

- `searchMemories(...)`
  - finds relevant memories for prompt context

- `addTask(...)`
  - stores a new assigned task

- `getTasks()`
  - returns current tasks

- `completeTaskByMatcher(...)`
  - marks a matching task completed

## Learning Functions

### `src/services/learning/personalFacts.js`

- extracts facts from sentences
- answers questions like `what is my name`

### `src/services/learning/behaviorTracker.js`

- stores daily usage behavior
- tracks apps, sites, language, and routines

### `src/services/manual/manualResponseStore.js`

- loads `data/manual-responses.json`
- returns superfast custom replies before AURA uses the AI model

## Performance Functions

### `src/services/analytics/performanceReporter.js`

- computes average latency
- computes p95 latency
- counts providers
- reports command success rate

## API Functions

### `src/api/server.js`

Routes:

- `GET /api/health`
- `GET /api/state`
- `GET /api/architecture`
- `GET /api/memory`
- `GET /api/brain`
- `GET /api/performance`
- `GET /api/default-commands`
- `GET /api/voice-profiles`
- `POST /api/talk`
- `POST /api/preferences`
- `POST /api/runtime`
- `POST /api/proactive-follow-up`
- `POST /api/presence-prompt`
- `POST /api/voice-profiles`
- `POST /api/voice-profiles/activate`

## Frontend Functions

### `web/app.js`

Main functions:

- `boot()`
  - initializes the dashboard

- `initializeSpeechRecognition()`
  - starts browser speech recognition system

- `attemptAutoStartListening()`
  - tries to start microphone listening automatically

- `talkToAura(...)`
  - sends chat or voice text to backend

- `speak(...)`
  - speaks AURA's reply using browser speech synthesis

- `scheduleSilenceFollowUp(...)`
  - schedules a follow-up if you do not answer

- `attemptStartupGreeting()`
  - speaks `AURA is working for you, master` when the dashboard starts

- `scheduleIdlePresencePrompt()`
  - after 5 minutes of idle time, AURA can ask `Any more help, master?`

- `refreshBrain()`
  - loads the private brain transparency panel

- `refreshMemory()`
  - loads memory view

- `refreshPerformance()`
  - loads performance view

- `saveVoiceSample()`
  - saves your recorded sample to the backend

```

## docs\INSTALL_WINDOWS.md

```md
# Install AURA On Windows

## 1. Required

- Windows laptop
- Node.js already installed
- Chrome or Edge
- VS Code

Optional:

- OpenAI API key for online chat
- Ollama for offline chat
- Supabase free account for cloud sync

## 2. Open The Project

Open this folder in VS Code:

- [New project](/C:/Users/ADMIN/Documents/New%20project)

## 3. Edit Config

Open:

- [config.local.json](/C:/Users/ADMIN/Documents/New%20project/config.local.json)

Change these values first:

1. Set your own `ownerName`.
2. Change `auth.ownerToken` to a private strong token.
3. Add your OpenAI API key if you want online chat.
4. Leave OpenAI blank if you only want offline/local mode.
5. Install Ollama and keep the default base URL if you want offline mode.

## 4. Start The App

In the VS Code terminal:

```powershell
node src/index.js
```

Then open:

- [http://localhost:4545](http://localhost:4545)

## 5. Enable Microphone

Use Chrome or Edge and allow microphone access.

Then click:

- `Start Listening`

## 6. Optional Offline Setup With Ollama

Install Ollama, then pull a local model such as:

```powershell
ollama pull llama3.1:8b
```

Keep these config values:

```json
"offline": {
  "provider": "ollama",
  "baseUrl": "http://127.0.0.1:11434",
  "model": "llama3.1:8b"
}
```

## 7. Optional Cloud Sync With Supabase

Create a table like this:

```sql
create table public.aura_sync (
  id bigint generated always as identity primary key,
  record_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
```

Then paste your `url` and `apiKey` into `config.local.json` and set:

```json
"cloudSync": true
```

## 8. Optional Dangerous Commands

If you want shutdown and restart by voice, set:

```json
"allowDangerousSystemActions": true
```

This is risky. Do not enable it until:

1. your owner token is changed
2. your microphone setup is stable
3. you understand false triggers can happen

## 9. Mobile Control

To control AURA from your phone:

1. Start AURA on your laptop.
2. Find your laptop IP with `ipconfig`.
3. Open `http://YOUR-LAPTOP-IP:4545` on your phone while both are on the same Wiâ€‘Fi.
4. Enter your owner token in the dashboard.

Now you can use the gesture pad and buttons from your phone.

```

## docs\TROUBLESHOOTING.md

```md
# Troubleshooting

## Browser says microphone blocked

Fix:

1. Open site permissions in Chrome or Edge.
2. Allow microphone for `localhost:4545`.
3. Reload the page.

## Speech recognition keeps stopping

Cause:

- browser security policy
- tab lost focus
- browser does not fully support continuous mode

Fix:

1. Keep the tab open.
2. Use latest Chrome or Edge.
3. Click `Start Listening` again.

## AURA hears its own voice

Cause:

- speaker audio leaks back into the mic

Fix:

1. Use headphones.
2. Lower speaker volume.
3. Keep the browser tab in front.

Note:

The dashboard already pauses listening while speech synthesis is talking, but hardware echo can still happen.

## OpenAI replies do not work

Check:

1. `config.local.json -> models.online.apiKey`
2. internet connection
3. correct model name

If it still fails:

1. switch dashboard mode to `Offline Preferred`
2. test Ollama separately

## Offline replies do not work

Check:

1. Ollama is installed
2. model was pulled
3. `http://127.0.0.1:11434` is reachable

## Browser commands do not open Chrome

Cause:

- Chrome may not be on PATH

Quick fix:

1. open `src/services/automation/browserActions.js`
2. change the browser executable to `msedge.exe`
3. or let Windows open the default browser

## Lock works but shutdown does not

Cause:

- dangerous commands are disabled by default

Fix:

1. open `config.local.json`
2. set `allowDangerousSystemActions` to `true`
3. restart AURA

## Mobile cannot connect

Check:

1. laptop and phone are on the same Wiâ€‘Fi
2. Windows Firewall allows Node.js on private networks
3. you used the correct laptop IP

## Tanglish is not perfect

Reason:

- browser speech recognition is better for standard language tags than mixed transliteration

Fix:

1. use Tamil mode for Tamil speech
2. speak slightly slower for Tanglish
3. use online mode when you want stronger multilingual interpretation

```


