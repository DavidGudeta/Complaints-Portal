import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import authRoutes from "./routes/authRoutes.js";
import { publicComplaintRoutes, internalComplaintRoutes } from "./routes/complaintRoutes.js";
import { adminUserRoutes, profileRoutes } from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { adminMetadataRoutes, publicMetadataRoutes } from "./routes/metadataRoutes.js";
import { registerClient } from "./utils/notifications.js";
import { checkDeadlines } from "./utils/deadlines.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // WebSocket connection handling
  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = parseInt(url.searchParams.get("userId") || "0");
    if (userId) {
      registerClient(userId, ws);
    }
  });

  // API Routes
  app.use("/api", authRoutes);
  app.use("/api/complaints", publicComplaintRoutes);
  app.use("/api/internal/complaints", internalComplaintRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/admin", adminMetadataRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api", publicMetadataRoutes);

  // Periodic check for deadlines (every hour)
  setInterval(checkDeadlines, 60 * 60 * 1000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "../dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
