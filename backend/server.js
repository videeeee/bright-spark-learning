const env = require("./config/env");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Trust reverse proxy (Render, Heroku, etc.)
app.set("trust proxy", 1);

// 1. Database Connection
connectDB();

// 2. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 3. CORS Configuration (Strict: exact origins from CLIENT_URL + localhost)
const allowedOrigins = env.CLIENT_URL.split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Always allow local development ports
const defaultLocalOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
];
defaultLocalOrigins.forEach((orig) => {
  if (!allowedOrigins.includes(orig)) allowedOrigins.push(orig);
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 4. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many requests from this IP, please try again in 15 minutes",
  },
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/signup attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many authentication attempts, please try again after 15 minutes",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// 5. Health Check Endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    databaseName: mongoose.connection.name || null,
    environment: env.NODE_ENV,
  });
});

// 6. API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/notes", require("./routes/notes.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/voice", require("./routes/voice.routes"));
app.use("/api/curriculum", require("./routes/curriculum.routes"));
app.use("/api/progress", require("./routes/progress.routes"));
app.use("/api/levels", require("./routes/levels.routes"));

// 7. Static Assets
app.use("/uploads", express.static("uploads"));

// 8. 404 Handler for Unmatched API Routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    msg: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 9. Centralized Error Handler
app.use(errorHandler);

// 10. Start Server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 LearnQuest Server running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`🔒 Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});

module.exports = { app, server };
