const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g. "Mathematics"
  },
  code: {
    type: String,
    required: true, // e.g. "MATH"
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema);
