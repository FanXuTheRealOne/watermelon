import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, join, normalize } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { analyzeWavBuffer } from "./src/audio-analysis.js";
import { getAiAssessment } from "./src/ai.js";

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = join(process.cwd(), "public");
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

loadDotEnv();

const server = createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/analyze") {
      await handleAnalyze(request, response);
      return;
    }

    if (request.method === "GET") {
      serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "分析失败，请重新录音再试一次",
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Watermelon app: http://localhost:${PORT}`);
  for (const address of getLanAddresses()) {
    console.log(`LAN: http://${address}:${PORT}`);
  }
});

async function handleAnalyze(request, response) {
  const audio = await readRequestBody(request, MAX_AUDIO_BYTES);
  const analysis = analyzeWavBuffer(audio);
  let assessment;

  try {
    assessment = await getAiAssessment(analysis);
  } catch (error) {
    assessment = {
      ...analysis.heuristic,
      aiUsed: false,
      aiError: error.message,
    };
  }

  sendJson(response, 200, {
    ...assessment,
    features: analysis.features,
  });
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": getContentType(filePath),
    "Cache-Control": filePath.endsWith("index.html") ? "no-store" : "public, max-age=3600",
  });
  response.end(readFileSync(filePath));
}

function readRequestBody(request, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new Error("录音文件太大，请控制在 8MB 内"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const extension = extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  }[extension] || "application/octet-stream";
}

function loadDotEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

function getLanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}
