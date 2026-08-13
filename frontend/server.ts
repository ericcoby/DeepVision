import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Express middleware for JSON & payload limits
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Express Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    mode: "integrated_webapp",
    message: "DeepVision WebApp Server operational.",
    timestamp: new Date().toISOString()
  });
});

// Python FastAPI Health Proxy
app.get("/api/health/python", (_req, res) => {
  const pythonUrl = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:8000/health";
  http.get(pythonUrl, (pythonRes) => {
    let body = "";
    pythonRes.on("data", (chunk) => (body += chunk));
    pythonRes.on("end", () => {
      try {
        res.json(JSON.parse(body));
      } catch (e) {
        res.status(500).json({ status: "error", message: "Invalid JSON from Python model server" });
      }
    });
  }).on("error", (err) => {
    res.status(503).json({ 
      status: "offline", 
      message: "Python FastAPI server on port 8000 not active",
      error: err.message 
    });
  });
});

// Forward /api/detect requests to Python FastAPI model backend (http://127.0.0.1:8000/api/detect)
app.post("/api/detect", (req, res) => {
  const pythonHost = process.env.PYTHON_HOST || "127.0.0.1";
  const pythonPort = Number(process.env.PYTHON_PORT) || 8000;

  const options: http.RequestOptions = {
    hostname: pythonHost,
    port: pythonPort,
    path: "/api/detect",
    method: "POST",
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.warn("[Proxy Warning] Could not connect to Python FastAPI backend:", err.message);
    res.status(503).json({
      error: "Python detection backend offline",
      detail: "FastAPI server is not running on port 8000. Operating in client fallback mode.",
      fallback: true
    });
  });

  req.pipe(proxyReq);
});

// Serve PWA Manifest with explicit manifest content-type header
app.get("/manifest.json", (_req, res) => {
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.sendFile(path.join(process.cwd(), "public", "manifest.json"));
});

// Serve Service Worker with explicit header and root scope
app.get("/sw.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(process.cwd(), "public", "sw.js"));
});

// Serve public folder for PWA icons and static assets
app.use(express.static(path.join(process.cwd(), "public")));

// Vite Server Integration for Frontend SPA
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DeepVision Integrated WebApp Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
