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
├── config.example.json
├── config.local.json
├── package.json
├── README.md
├── data/
│   └── aura.db.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── COMMAND_EXAMPLES.md
│   ├── INSTALL_WINDOWS.md
│   └── TROUBLESHOOTING.md
├── src/
│   ├── api/
│   │   └── server.js
│   ├── config/
│   │   ├── languages.js
│   │   └── loadConfig.js
│   ├── core/
│   │   ├── auraEngine.js
│   │   └── promptBuilder.js
│   ├── services/
│   │   ├── automation/
│   │   │   ├── browserActions.js
│   │   │   ├── commandRouter.js
│   │   │   ├── powershellBridge.js
│   │   │   └── systemActions.js
│   │   ├── cloud/
│   │   │   └── supabaseSync.js
│   │   ├── learning/
│   │   │   └── behaviorTracker.js
│   │   ├── llm/
│   │   │   ├── ollamaClient.js
│   │   │   └── openaiClient.js
│   │   └── memory/
│   │       └── localDatabase.js
│   ├── utils/
│   │   ├── jsonFile.js
│   │   └── logger.js
│   └── index.js
└── web/
    ├── app.js
    ├── index.html
    └── styles.css
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
