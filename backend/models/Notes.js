const mongoose = require("mongoose");

const NotesSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  topic: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notes", NotesSchema);
