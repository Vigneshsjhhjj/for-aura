import fs from "node:fs";
import path from "node:path";
import { createServer as createHttpServer } from "node:http";
import { DEFAULT_COMMANDS } from "../config/defaultCommands.js";
import { LANGUAGE_OPTIONS } from "../config/languages.js";

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Aura-Owner-Token",
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

function isLoopbackAddress(clientAddress) {
  const normalized = clientAddress?.replace("::ffff:", "") ?? "";
  return normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost";
}

function isPrivateAddress(clientAddress) {
  const normalized = clientAddress?.replace("::ffff:", "") ?? "";
  return (
    normalized.startsWith("192.168.") ||
    normalized.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

function verifyOwner(request, config) {
  const clientAddress = request.socket.remoteAddress ?? "";
  const providedToken = request.headers["x-aura-owner-token"];

  if (isLoopbackAddress(clientAddress)) {
    return true;
  }

  if (config.server.trustLocalNetwork && isPrivateAddress(clientAddress)) {
    return providedToken === config.auth.ownerToken;
  }

  return providedToken === config.auth.ownerToken;
}

async function parseJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sanitizeFileSegment(value) {
  return value.replace(/[^a-z0-9-_]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function requireOwnerAccess(request, response, config) {
  if (!config.modes.ownerOnlyTransparency) {
    return true;
  }

  if (verifyOwner(request, config)) {
    return true;
  }

  sendJson(response, 403, {
    ok: false,
    error: "Owner verification required for private AURA transparency data."
  });
  return false;
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
  const contentTypeMap = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml"
  };

  const content = fs.readFileSync(filePath);
  sendText(response, 200, content, contentTypeMap[extension] ?? "application/octet-stream");
}

export function createServer({ config, engine, database }) {
  const eventClients = new Set();

  engine.on("state", (payload) => {
    const serialized = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of eventClients) {
      client.write(serialized);
    }
  });

  return createHttpServer(async (request, response) => {
    if (!request.url) {
      sendText(response, 400, "Bad Request");
      return;
    }

    const parsedUrl = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-Aura-Owner-Token",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      });
      response.end();
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        assistantName: config.assistantName,
        uptimeMs: Date.now() - new Date(engine.state.bootedAt).getTime()
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/state") {
      sendJson(response, 200, engine.getPublicState());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/events") {
      response.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*"
      });
      response.write(`data: ${JSON.stringify(engine.getPublicState())}\n\n`);
      eventClients.add(response);
      request.on("close", () => {
        eventClients.delete(response);
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/architecture") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getArchitectureReport());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/memory") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, {
        profile: database.getProfile(),
        preferences: database.getPreferences(),
        recentEvents: database.getRecentEvents(30),
        learning: database.getLearningSummary(),
        voiceProfiles: database.getVoiceProfiles(),
        tasks: database.getTasks(),
        databaseConnection: {
          localJsonFile: config.storage.localDbPath,
          cloudConfigured: Boolean(config.storage.cloud.url && config.storage.cloud.apiKey)
        }
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/performance") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getPerformanceReport());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/voice-profiles") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, {
        voiceMode: config.voices.mode,
        customTts: config.voices.customTts,
        ...database.getVoiceProfiles()
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/brain") {
      if (!requireOwnerAccess(request, response, config)) {
        return;
      }
      sendJson(response, 200, engine.getBrainSnapshot());
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/default-commands") {
      sendJson(response, 200, {
        defaultCommands: DEFAULT_COMMANDS
      });
      return;
    }

    if (request.method === "GET" && parsedUrl.pathname === "/api/languages") {
      sendJson(response, 200, {
        languages: LANGUAGE_OPTIONS
      });
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/talk") {
      try {
        const body = await parseJsonBody(request);
        const ownerVerified = verifyOwner(request, config);
        const result = await engine.processUserText({
          text: body.text ?? "",
          source: body.source ?? "voice",
          ownerVerified
        });
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 500, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/preferences") {
      try {
        const body = await parseJsonBody(request);
        const nextPreferences = engine.updatePreferences(body);
        sendJson(response, 200, {
          ok: true,
          preferences: nextPreferences
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/runtime") {
      try {
        const body = await parseJsonBody(request);
        const nextState = engine.updateRuntime({
          onlinePreferred:
            typeof body.onlinePreferred === "boolean"
              ? body.onlinePreferred
              : engine.state.onlinePreferred,
          speaking:
            typeof body.speaking === "boolean" ? body.speaking : engine.state.speaking
        });
        sendJson(response, 200, {
          ok: true,
          ...nextState
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/proactive-follow-up") {
      try {
        const result = engine.createProactiveFollowUp();
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/presence-prompt") {
      try {
        const body = await parseJsonBody(request);
        const result = engine.createPresencePrompt(body.reason ?? "idle-help");
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/voice-profiles") {
      try {
        const ownerVerified = verifyOwner(request, config);
        if (!ownerVerified) {
          sendJson(response, 403, {
            ok: false,
            error: "Owner verification failed."
          });
          return;
        }

        const body = await parseJsonBody(request);
        const label = String(body.label ?? "Custom Voice").trim();
        const mimeType = String(body.mimeType ?? "audio/webm");
        const base64Audio = String(body.base64Audio ?? "");

        if (!base64Audio) {
          sendJson(response, 400, {
            ok: false,
            error: "Missing base64Audio payload."
          });
          return;
        }

        const extensionMap = {
          "audio/webm": ".webm",
          "audio/wav": ".wav",
          "audio/mpeg": ".mp3"
        };
        const extension = extensionMap[mimeType] ?? ".bin";
        const safeLabel = sanitizeFileSegment(label || "custom-voice");
        const fileName = `${Date.now()}-${safeLabel}${extension}`;
        const targetPath = path.resolve(config.storage.voiceSamplesDir, fileName);
        const buffer = Buffer.from(base64Audio, "base64");

        fs.mkdirSync(config.storage.voiceSamplesDir, { recursive: true });
        fs.writeFileSync(targetPath, buffer);

        const createdVoiceProfile = database.addVoiceProfile({
          label,
          fileName,
          relativePath: path.relative(config.paths.projectRoot, targetPath),
          mimeType,
          sizeBytes: buffer.byteLength
        });

        sendJson(response, 200, {
          ok: true,
          message:
            "Voice sample stored. Browser TTS will still be used until you connect a custom TTS engine.",
          voiceProfile: createdVoiceProfile,
          voiceProfiles: database.getVoiceProfiles()
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    if (request.method === "POST" && parsedUrl.pathname === "/api/voice-profiles/activate") {
      try {
        const ownerVerified = verifyOwner(request, config);
        if (!ownerVerified) {
          sendJson(response, 403, {
            ok: false,
            error: "Owner verification failed."
          });
          return;
        }

        const body = await parseJsonBody(request);
        const activeVoice = database.setActiveVoiceProfile(String(body.voiceProfileId ?? ""));
        if (!activeVoice) {
          sendJson(response, 404, {
            ok: false,
            error: "Voice profile not found."
          });
          return;
        }

        sendJson(response, 200, {
          ok: true,
          activeVoice,
          voiceProfiles: database.getVoiceProfiles()
        });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          error: error.message
        });
      }
      return;
    }

    serveStaticFile(config.paths.webRoot, parsedUrl.pathname, response);
  });
}
