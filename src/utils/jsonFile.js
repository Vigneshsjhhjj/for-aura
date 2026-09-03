import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJson(filePath, fallbackValue) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return structuredClone(fallbackValue);
  }
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function safeResolve(rootDir, maybeRelativePath) {
  return path.isAbsolute(maybeRelativePath)
    ? maybeRelativePath
    : path.resolve(rootDir, maybeRelativePath);
}
