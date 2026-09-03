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
