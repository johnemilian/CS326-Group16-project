import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import tasksRouter from "./routes/tasks.js";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import { attachUser } from "./middleware/attachUser.js";
import { asyncHandler } from "./asyncHandler.js";

const { MONGODB_URI, SESSION_SECRET } = process.env;
if (!MONGODB_URI || !SESSION_SECRET) {
  console.error("MONGODB_URI and SESSION_SECRET must be set. Copy .env.example to .env and fill them in.");
  process.exit(1);
}
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

await mongoose.connect(MONGODB_URI);

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
// Behind a proxy that terminates HTTPS, so secure cookies are still sent.
if (isProduction) app.set("trust proxy", 1);

// Before sessions, so a health check never creates a session or looks up a user.
app.use("/health", healthRouter);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // Sessions live in MongoDB (a "sessions" collection), so they survive a restart.
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
    cookie: { httpOnly: true, sameSite: "lax", secure: isProduction },
  }),
);
app.use(asyncHandler(attachUser));

app.use("/", authRouter);
app.use("/tasks", tasksRouter);
app.use((req, res) => {
  res.status(404).send("Page not found.");
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong.");
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
