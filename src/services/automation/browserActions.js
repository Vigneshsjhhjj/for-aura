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
