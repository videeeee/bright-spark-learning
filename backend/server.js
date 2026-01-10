require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/notes", require("./routes/notes.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/voice", require("./routes/voice.routes"));
app.use("/uploads", express.static("uploads"));

app.listen(process.env.PORT, () =>
  console.log("Server running on port", process.env.PORT)
);
