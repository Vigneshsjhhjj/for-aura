import fs from "node:fs";
import path from "node:path";
import { createServer as createHttpServer } from "node:http";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  response.end(`${JSON.stringify(data, null, 2)}\n`);
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  response.end(text);
}

async function parseJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function serveStaticFile(webRoot, requestPath, response) {
  const cleanPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.resolve(webRoot, `.${cleanPath}`);

  if (!filePath.startsWith(webRoot)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, "Not Found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  sendText(
    response,
    200,
    fs.readFileSync(filePath),
    contentTypes[extension] ?? "application/octet-stream"
  );
}

function route(method, pathname) {
  return `${method.toUpperCase()} ${pathname}`;
}

export function createServer({ webRoot, store }) {
  return createHttpServer(async (request, response) => {
    if (!request.url) {
      sendText(response, 400, "Bad Request");
      return;
    }

    const parsedUrl = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
    const key = route(request.method ?? "GET", parsedUrl.pathname);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      });
      response.end();
      return;
    }

    try {
      if (key === "GET /api/health") {
        sendJson(response, 200, {
          ok: true,
          name: "SmartMaintain AI",
          uptimeSeconds: Math.round(process.uptime())
        });
        return;
      }

      if (key === "GET /api/snapshot") {
        sendJson(response, 200, store.getSnapshot());
        return;
      }

      if (key === "POST /api/inspections") {
        const body = await parseJsonBody(request);
        const inspection = store.addInspection(body);
        sendJson(response, 201, {
          ok: true,
          inspection,
          snapshot: store.getSnapshot()
        });
        return;
      }

      if (key === "POST /api/knowledge") {
        const body = await parseJsonBody(request);
        const result = store.addKnowledgeEntry(body);
        sendJson(response, 201, {
          ok: true,
          ...result,
          snapshot: store.getSnapshot()
        });
        return;
      }

      if (key === "POST /api/work-orders") {
        const body = await parseJsonBody(request);
        const workOrder = store.createWorkOrder(body);
        sendJson(response, 201, {
          ok: true,
          workOrder,
          snapshot: store.getSnapshot()
        });
        return;
      }

      if (key === "POST /api/workforce/absence") {
        const body = await parseJsonBody(request);
        const worker = store.updateWorkerAbsence(String(body.workerId ?? ""), Boolean(body.absent));
        sendJson(response, 200, {
          ok: true,
          worker,
          snapshot: store.getSnapshot()
        });
        return;
      }

      if (key === "POST /api/copilot") {
        const body = await parseJsonBody(request);
        sendJson(response, 200, {
          ok: true,
          ...store.answerCopilot(body.question)
        });
        return;
      }

      serveStaticFile(webRoot, parsedUrl.pathname, response);
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: error.message
      });
    }
  });
}
