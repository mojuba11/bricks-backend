const obsClient = require("../models/obsClient"); // Ensure you create this client file
const Device = require("../models/Device");
const fs = require("fs");

// 1. Webhook: Receives real-time GPS metadata from the streaming server
exports.handleLiveGPS = async (req, res) => {
  try {
    const { deviceId, latitude, longitude, speed } = req.body;

    // Dynamically update the device's coordinates in MongoDB
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId }, // Assumes your Device schema has a unique 'deviceId' string field
      { 
        $set: { 
          "location.coordinates": [longitude, latitude], // GeoJSON format
          "location.speed": speed,
          "location.lastUpdated": new Date()
        } 
      },
      { new: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({ message: "Device profile not found for GPS log" });
    }

    res.status(200).send("GPS Logged Successfully");
  } catch (err) {
    res.status(500).json({ error: "GPS Update Error: " + err.message });
  }
};

// 2. Webhook: Fired when stream stops. Transfers the video from ECS storage to OBS
exports.archiveStreamToOBS = async (req, res) => {
  try {
    const { deviceId, localFilePath } = req.body; 
    
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return res.status(400).json({ message: "Source video file not found on ECS" });
    }

    const dateStamp = new Date().toISOString().split("T")[0];
    const obsObjectKey = `bodycam_evidence/${deviceId}/${dateStamp}_${Date.now()}.mp4`;

    // Stream the temporary file straight off your ECS into your cloud storage bucket
    obsClient.putObject({
      Bucket: process.env.OBS_BUCKET_NAME,
      Key: obsObjectKey,
      SourceFile: localFilePath 
    }, async (err, result) => {
      if (err || result.CommonMsg.Status >= 300) {
        console.error("OBS Upload Failed:", err || result.CommonMsg.Code);
        return res.status(500).json({ error: "Failed to upload video to OBS" });
      }

      // Cleanup: Erase the temporary video from your ECS disk storage
      fs.unlinkSync(localFilePath);

      // Optional: Log the recorded cloud playback URL back into the database
      await Device.findOneAndUpdate(
        { deviceId },
        { $set: { lastRecordedVideo: obsObjectKey } }
      );

      res.status(200).json({ 
        message: "Video successfully stored in OBS and cleared from ECS local cache", 
        cloudPath: obsObjectKey 
      });
    });

  } catch (err) {
    res.status(500).json({ error: "Archiving Exception: " + err.message });
  }
};
