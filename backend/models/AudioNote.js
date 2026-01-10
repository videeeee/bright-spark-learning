const mongoose = require("mongoose");

const AudioNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topic: String,
  audioUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AudioNote", AudioNoteSchema);
