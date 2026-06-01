const express = require("express");
const router = express.Router();
const { 
  getDevices, 
  addDevice, 
  updateDevice, 
  deleteDevice,
  updateDeviceHeartbeat // 📍 NEW: Imported your heartbeat controller function
} = require("../controllers/deviceController");

/**
 * All routes here are relative to the path defined in server.js 
 * We are using SINGULAR 'device' to match your frontend API_URL
 */

// @route   GET /api/device
router.get("/", getDevices);

// @route   POST /api/device
router.post("/", addDevice);

// @route   POST /api/device/heartbeat
// 📍 NEW: This maps the exact singular path your AWS script is hitting
router.post("/heartbeat", updateDeviceHeartbeat); 

// @route   PUT /api/device/:id
router.put("/:id", updateDevice);

// @route   DELETE /api/device/:id
router.delete("/:id", deleteDevice);

module.exports = router;
