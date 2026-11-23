import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Mongoose readyState numbers, as words.
const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

// 200 when the app and the database are both up, 503 when the database is
// not connected, so a monitor can tell the two apart.
router.get("/", (req, res) => {
  const db = dbStates[mongoose.connection.readyState] ?? "unknown";
  const ok = db === "connected";
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "error",
    db,
    uptime: Math.round(process.uptime()),
  });
});

export default router;
