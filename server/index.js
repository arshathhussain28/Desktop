const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();


const app = express();


// ===== Middleware =====
app.use(cors());
app.use(express.json());



// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));



// ===== Function to generate ORPHAN ID =====
function generateOrphanId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";


  for (let i = 0; i < 12; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }


  return "ORPHAN" + randomPart;
}



// ===== Schema =====
const labelSchema = new mongoose.Schema({
  labelId: {
    type: String,
    required: true
  },
  generatedId: {
    type: String,
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


const Label = mongoose.model("Label", labelSchema);



// ===== Routes =====


// Test route
app.get("/", (req, res) => {
  res.send("🚀 API + DB running");
});



// ===== Create label =====
app.post("/labels", async (req, res) => {
  try {
    const { labelId, zone } = req.body;


    if (!labelId || !zone) {
      return res.status(400).json({ error: "Label ID and Zone are required" });
    }


    const newLabel = new Label({
      labelId,
      zone,
      generatedId: generateOrphanId()
    });


    await newLabel.save();


    res.json({
      message: "✅ Label created",
      data: newLabel
    });


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ===== Get all labels =====
app.get("/labels", async (req, res) => {
  try {
    const labels = await Label.find().sort({ createdAt: -1 });
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ===== Delete label (optional) =====
app.delete("/labels/:id", async (req, res) => {
  try {
    await Label.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Label deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ===== Cron Job for Automatic Deletion of Old Labels =====
// Runs every day at midnight (0 0 * * *)
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily cleanup job for old labels...");
  try {
    // Calculate the cutoff date (18 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 18);

    // Delete all labels older than the cutoff date
    const result = await Label.deleteMany({ createdAt: { $lte: cutoffDate } });
    console.log(`🧹 Cleanup job complete. Deleted ${result.deletedCount} old labels.`);
  } catch (err) {
    console.error("❌ Error during cleanup job:", err);
  }
});



// ===== Server =====
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});