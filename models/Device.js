const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  // Core Identity
  deviceId: { type: String, required: true, unique: true, trim: true },
  deviceName: { type: String, required: true },
  deviceSerial: { type: String }, 
  
  // Organization & Specs
  dept: { type: String, default: "Unassigned" },
  firm: { type: String },
  capacity: { type: String },
  
  // Status & Settings
  deviceState: { type: String, default: "Normal" },
  videoServer: { type: String, default: "Video Server H264+AAC" },
  recordVideo: { type: String, default: "No" },
  
  // Live Camera Sync
  streamUrl: { type: String, default: "" },

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

  // UI/Map related
  status: { type: String, default: "Offline" },
  batteryLevel: { type: Number, default: 100 },

  // --- NEW FIELD FOR LIVE GRID ---
  // Stores which box (1-16) the camera is assigned to
  slot: { type: String, default: null }

}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);