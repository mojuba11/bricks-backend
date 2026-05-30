const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Webhook: Fired continuously by the streaming server to pass real-time bodycam GPS telemetry
router.post("/gps", videoController.handleLiveGPS);

// Webhook: Fired by the streaming server when a stream cuts off, triggering the file transfer to OBS
router.post("/archive", videoController.archiveStreamToOBS);

module.exports = router;
