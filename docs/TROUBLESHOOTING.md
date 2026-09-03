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

1. laptop and phone are on the same Wi‑Fi
2. Windows Firewall allows Node.js on private networks
3. you used the correct laptop IP

## Tanglish is not perfect

Reason:

- browser speech recognition is better for standard language tags than mixed transliteration

Fix:

1. use Tamil mode for Tamil speech
2. speak slightly slower for Tanglish
3. use online mode when you want stronger multilingual interpretation
