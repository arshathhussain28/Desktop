const mongoose = require("mongoose");


const DataSchema = new mongoose.Schema({
  labelId: {
    type: String,
    required: true
  },
  generatedId: {
    type: String,
    required: true,
    unique: true
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


module.exports = mongoose.model("Data", DataSchema);