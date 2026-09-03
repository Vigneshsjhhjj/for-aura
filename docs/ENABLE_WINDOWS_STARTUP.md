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
