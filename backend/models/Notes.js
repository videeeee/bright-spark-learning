const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: String,
  title: String,
  content: mongoose.Schema.Types.Mixed,
  style: { type: String, default: "default" },
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);