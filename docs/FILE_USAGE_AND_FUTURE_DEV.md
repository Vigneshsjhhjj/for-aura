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
