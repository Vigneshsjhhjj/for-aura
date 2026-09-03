export function logInfo(message, details) {
  if (details) {
    console.log(`[AURA] ${message}`, details);
    return;
  }

  console.log(`[AURA] ${message}`);
}

export function logError(message, error) {
  console.error(`[AURA] ${message}`);
  if (error) {
    console.error(error);
  }
}
