require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

// Enable CORS before routes
app.use(cors());
app.use(express.json());

// Auth Routes (must be before other middleware)
app.use("/api/auth", require("./routes/auth.routes"));

// Protected Routes
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/notes", require("./routes/notes.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/voice", require("./routes/voice.routes"));
app.use("/api/curriculum", require("./routes/curriculum.routes"));
app.use("/api/progress", require("./routes/progress.routes"));
app.use("/api/levels", require("./routes/levels.routes"));

// Static files
app.use("/uploads", express.static("uploads"));

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ msg: "Internal server error" });
});

// Start server
app.listen(process.env.PORT || 5000, () =>
  console.log("✅ Server running on port", process.env.PORT || 5000)
);
