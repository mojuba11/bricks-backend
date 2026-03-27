const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  // Core Identity
  deviceId: { type: String, required: true, unique: true },
  deviceName: { type: String, required: true },
  deviceSerial: { type: String }, // Keep this if you use it elsewhere
  
  // Organization & Specs
  dept: { type: String },
  firm: { type: String },
  capacity: { type: String },
  
  // Status & Settings
  deviceState: { type: String, default: "Normal" },
  videoServer: { type: String, default: "Video Server H264+AAC" },
  recordVideo: { type: String, default: "No" },
  
  // GPS & Fence
  gpsType: { type: String, default: "WGS84" },
  gpsInterval: { type: String, default: "1000" },
  enableFence: { type: String, default: "No" },
  fenceName: { type: String },
  fenceAlarm: { type: String, default: "No" },
  
  // Versioning
  hardwareSerial: String,
  hardwareVersion: String,
  softwareVersion: String,
  intelligentAnalysis: String,

  // UI/Map related (Added for your Live Map later)
  status: { type: String, default: "Offline" },
  batteryLevel: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);