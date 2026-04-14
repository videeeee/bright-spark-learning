const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  classLevel: { type: String, default: null },
  curriculum: { type: String, default: null },
  subjects: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);