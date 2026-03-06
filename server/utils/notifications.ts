import db from "../db/index.js";
import { WebSocket } from "ws";

const clients = new Map<number, WebSocket>();

export const registerClient = (userId: number, ws: WebSocket) => {
  clients.set(userId, ws);
  ws.on("close", () => clients.delete(userId));
};

export const broadcastNotification = (userId: number, notification: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: "NOTIFICATION", data: notification }));
  }
};

export const createNotification = (userId: number, type: string, title: string, message: string, link?: string) => {
  const result = db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, type, title, message, link);
  
  const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(result.lastInsertRowid);
  broadcastNotification(userId, notification);
  return notification;
};
