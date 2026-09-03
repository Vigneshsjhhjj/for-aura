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
