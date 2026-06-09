import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_PROJECTS } from "./src/data";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Make sure upload directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Parse heavy payloads (since base64 files can be large)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Static route for served uploads BEFORE any Vite routing
  app.use("/uploads", express.static(uploadsDir));

  // Projects DB persistence path
  const dbPath = path.join(process.cwd(), "projects-db.json");

  // API endpoints
  app.get("/api/projects", (req, res) => {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        return res.json(JSON.parse(fileContent));
      }
      // If db file doesn't exist, create it from INITIAL_PROJECTS
      fs.writeFileSync(dbPath, JSON.stringify(INITIAL_PROJECTS, null, 2), "utf-8");
      return res.json(INITIAL_PROJECTS);
    } catch (err) {
      console.error("Failed to load projects:", err);
      return res.json(INITIAL_PROJECTS);
    }
  });

  app.post("/api/projects", (req, res) => {
    try {
      const { projects } = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ error: "Invalid projects data" });
      }
      fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), "utf-8");
      res.json({ success: true, message: "Database updated successfully" });
    } catch (err) {
      console.error("Failed to save projects:", err);
      res.status(500).json({ error: "Failed to save projects database" });
    }
  });

  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, base64 } = req.body;
      if (!base64 || !filename) {
        return res.status(400).json({ error: "Missing base64 data or filename" });
      }

      // Cleanly and safely strip standard Base64 Data URI scheme if present (e.g., data:image/png;base64,...)
      let dataString = base64;
      let mimeType = "image/jpeg";
      if (base64.startsWith("data:")) {
        const parts = base64.split(";base64,");
        if (parts.length > 1) {
          dataString = parts[1];
        }
        const match = base64.match(/^data:(.*?);base64,/);
        if (match) {
          mimeType = match[1];
        }
      }

      const buffer = Buffer.from(dataString, "base64");

      // Attempt to host externally on Catbox.moe so images work in ALL environments, other domains, sharing links, etc.
      try {
        if (typeof FormData !== "undefined" && typeof Blob !== "undefined") {
          const catboxFormData = new FormData();
          catboxFormData.append("reqtype", "fileupload");
          const blob = new Blob([buffer], { type: mimeType });
          catboxFormData.append("fileToUpload", blob, filename);

          const response = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: catboxFormData,
          });

          if (response.ok) {
            const rawText = await response.text();
            const trimmedUrl = rawText.trim();
            if (trimmedUrl && trimmedUrl.startsWith("http")) {
              console.log(`[Server API] Successfully uploaded to Catbox: ${trimmedUrl}`);
              return res.json({ url: trimmedUrl });
            }
          }
          console.warn(`[Server API] Catbox upload returned status ${response.status}`);
        }
      } catch (catboxErr) {
        console.warn("[Server API] Failed to upload to Catbox, falling back to local storage:", catboxErr);
      }
      
      // Clean and sanitize filename to prevent path traversal
      const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${Date.now()}-${cleanName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(filePath, buffer);
      console.log(`Saved uploaded file locally: ${uniqueName}`);
      
      res.json({ url: `/uploads/${uniqueName}` });
    } catch (err) {
      console.error("Error saving uploaded file:", err);
      res.status(500).json({ error: "Failed to write file to disk" });
    }
  });

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
