import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config/loadConfig.js";
import { LocalDatabase } from "./services/memory/localDatabase.js";
import { BehaviorTracker } from "./services/learning/behaviorTracker.js";
import { PerformanceReporter } from "./services/analytics/performanceReporter.js";
import { OpenAIClient } from "./services/llm/openaiClient.js";
import { OllamaClient } from "./services/llm/ollamaClient.js";
import { SupabaseSync } from "./services/cloud/supabaseSync.js";
import { AuraEngine } from "./core/auraEngine.js";
import { createServer } from "./api/server.js";
import { logInfo, logError } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const config = loadConfig(projectRoot);
const database = new LocalDatabase(config.storage.localDbPath, config);
database.init();

const behaviorTracker = new BehaviorTracker(database);
const performanceReporter = new PerformanceReporter(database);
const openAIClient = new OpenAIClient(config.models.online);
const ollamaClient = new OllamaClient(config.models.offline);
const cloudSync = new SupabaseSync(config.storage.cloud);

const engine = new AuraEngine({
  config,
  database,
  behaviorTracker,
  performanceReporter,
  openAIClient,
  ollamaClient,
  cloudSync
});

const server = createServer({ config, engine, database });

server.listen(config.server.port, config.server.host, () => {
  logInfo(
    `${config.assistantName} is running at http://localhost:${config.server.port}`
  );
});

server.on("error", (error) => {
  logError("Server failed to start.", error);
});
