const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subject: String,
  percentage: Number
});

module.exports = mongoose.model("Progress", ProgressSchema);
