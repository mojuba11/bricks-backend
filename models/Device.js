const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceName: { type: String, required: true },
  deviceSerial: { type: String, required: true, unique: true },
  model: { type: String },
  assignedUser: { type: String },
  batteryLevel: { type: Number, default: 100 },
  status: { type: String, default: "Offline" }
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);