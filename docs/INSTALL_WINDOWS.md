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
3. Open `http://YOUR-LAPTOP-IP:4545` on your phone while both are on the same Wi‑Fi.
4. Enter your owner token in the dashboard.

Now you can use the gesture pad and buttons from your phone.
