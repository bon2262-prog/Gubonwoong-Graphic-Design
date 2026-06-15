import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url) return next();

            const cleanUrl = req.url.split('?')[0];

            // -- GET /api/projects --
            if (cleanUrl.startsWith('/api/projects') && req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              try {
                const dbPath = path.join(process.cwd(), 'projects-db.json');
                if (fs.existsSync(dbPath)) {
                  res.end(fs.readFileSync(dbPath, 'utf-8'));
                } else {
                  res.end('[]');
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err?.message || 'Error loading projects' }));
              }
              return;
            }

            // -- POST /api/projects --
            if (cleanUrl.startsWith('/api/projects') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                res.setHeader('Content-Type', 'application/json');
                try {
                  const { projects } = JSON.parse(body);
                  if (!Array.isArray(projects)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: "Invalid projects data" }));
                    return;
                  }
                  const dbPath = path.join(process.cwd(), 'projects-db.json');
                  fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), 'utf-8');
                  res.end(JSON.stringify({ success: true, message: "Database updated" }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err?.message || 'Error saving projects' }));
                }
              });
              req.resume(); // Flow control safeguard
              return;
            }

            // -- POST /api/upload --
            if (cleanUrl.startsWith('/api/upload') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                res.setHeader('Content-Type', 'application/json');
                try {
                  const parsed = JSON.parse(body);
                  const { filename, base64 } = parsed;
                  if (!filename || !base64) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: "Missing base64 data or filename" }));
                    return;
                  }

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

                  // Attempt to upload to Catbox.moe first so files are accessible globally in all environments
                  try {
                    if (typeof FormData !== "undefined" && typeof Blob !== "undefined") {
                      const catboxFormData = new FormData();
                      catboxFormData.append("reqtype", "fileupload");
                      const blob = new Blob([buffer], { type: mimeType });
                      catboxFormData.append("fileToUpload", blob, filename);

                      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
                        method: "POST",
                        body: catboxFormData,
                        headers: {
                          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        }
                      });

                      if (catboxRes.ok) {
                        const rawText = await catboxRes.text();
                        const trimmedUrl = rawText.trim();
                        if (trimmedUrl && trimmedUrl.startsWith("http")) {
                          console.log(`[Vite API Middleware] Successfully uploaded to Catbox: ${trimmedUrl}`);
                          res.end(JSON.stringify({ url: trimmedUrl }));
                          return;
                        }
                      }
                      console.warn(`[Vite API Middleware] Catbox upload status: ${catboxRes.status}`);
                    }
                  } catch (catboxErr) {
                    console.warn("[Vite API Middleware] Failed Catbox upload, falling back to local file:", catboxErr);
                  }

                  const uploadsDir = path.join(process.cwd(), "uploads");
                  if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                  }

                  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
                  const uniqueName = `${Date.now()}-${cleanName}`;
                  const filePath = path.join(uploadsDir, uniqueName);

                  fs.writeFileSync(filePath, buffer);
                  console.log(`[Vite API Middleware] Saved upload locally: ${uniqueName}`);

                  res.end(JSON.stringify({ url: `/uploads/${uniqueName}` }));
                } catch (err: any) {
                  console.error("[Vite API Middleware] Upload error:", err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err?.message || "Failed to write file to disk" }));
                }
              });
              req.resume(); // Flow control safeguard
              return;
            }

            // -- GET /uploads/... (serve uploaded files) --
            if (req.url.startsWith('/uploads/') && req.method === 'GET') {
              const cleanUrl = req.url.split('?')[0];
              const filePath = path.join(process.cwd(), cleanUrl);
              if (fs.existsSync(filePath)) {
                let contentType = 'application/octet-stream';
                if (filePath.endsWith('.png')) contentType = 'image/png';
                else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
                else if (filePath.endsWith('.gif')) contentType = 'image/gif';
                else if (filePath.endsWith('.webp')) contentType = 'image/webp';
                else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
                else if (filePath.endsWith('.mp4')) contentType = 'video/mp4';

                res.setHeader('Content-Type', contentType);
                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
              } else {
                res.statusCode = 404;
                res.end('Not Found');
              }
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
