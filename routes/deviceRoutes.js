const express = require("express");
const router = express.Router();
const { 
  getDevices, 
  addDevice, 
  updateDevice, 
  deleteDevice 
} = require("../controllers/deviceController");

/**
 * All routes here are relative to the path defined in server.js 
 * We are using SINGULAR 'device' to match your frontend API_URL
 */

// @route   GET /api/device
router.get("/", getDevices);

// @route   POST /api/device
router.post("/", addDevice);

// @route   PUT /api/device/:id
router.put("/:id", updateDevice);

// @route   DELETE /api/device/:id
router.delete("/:id", deleteDevice);

module.exports = router;