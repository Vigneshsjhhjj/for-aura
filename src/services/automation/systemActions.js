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
