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
