const express = require("express");
const router = express.Router();
const { getDevices, addDevice, updateDevice, deleteDevice } = require("../controllers/deviceController");

// @route   GET /api/devices
router.get("/", getDevices);

// @route   POST /api/devices
router.post("/", addDevice);

// @route   PUT /api/devices/:id
router.put("/:id", updateDevice);

// @route   DELETE /api/devices/:id
router.delete("/:id", deleteDevice);

module.exports = router;