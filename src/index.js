import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "./api/server.js";
import { SmartMaintainStore } from "./services/smartmaintain/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 4545),
  webRoot: path.join(projectRoot, "web"),
  dataPath: path.join(projectRoot, "data", "smartmaintain.db.json")
};

const store = new SmartMaintainStore(config.dataPath);
store.init();

const server = createServer({
  webRoot: config.webRoot,
  store
});

server.listen(config.port, config.host, () => {
  console.log(`SmartMaintain AI is running at http://${config.host}:${config.port}`);
});

server.on("error", (error) => {
  console.error("SmartMaintain AI failed to start.", error);
  process.exitCode = 1;
});
