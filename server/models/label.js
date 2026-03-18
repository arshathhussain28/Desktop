const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema({
  labelId: {
    type: String,
    required: true
  },
  generatedId: {
    type: String
  },
  zone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Label", labelSchema);
