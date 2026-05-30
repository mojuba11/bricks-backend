const s3Client = require("../models/s3Client"); // Imported universal v3 client
const { PutObjectCommand } = require("@aws-sdk/client-s3"); // Required for universal S3 uploads
const Device = require("../models/Device");
const fs = require("fs");
const path = require("path");

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

// 2. Webhook: Fired when stream stops. Transfers the video from ECS storage to Cloud Object Storage
exports.archiveStreamToOBS = async (req, res) => {
  try {
    // Media server passes the deviceId and either a local path or filename 
    const { deviceId, localFilePath } = req.body; 
    
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return res.status(400).json({ message: "Source video file not found on ECS local drive" });
    }

    const dateStamp = new Date().toISOString().split("T")[0];
    const objectKey = `bodycam_evidence/${deviceId || 'unknown'}/${dateStamp}_${Date.now()}.mp4`;

    // Create a high-performance readable stream from the ECS local hard drive file
    const fileStream = fs.createReadStream(localFilePath);

    const uploadParams = {
      Bucket: process.env.CLOUD_STORAGE_BUCKET_NAME,
      Key: objectKey,
      Body: fileStream,
      ContentType: "video/mp4"
    };

    // Execute the command using the universal S3 SDK standard
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Cleanup: Securely erase the temporary video from your ECS disk storage to preserve space
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Log the recorded cloud object key back into the database device schema
    if (deviceId) {
      await Device.findOneAndUpdate(
        { deviceId },
        { $set: { lastRecordedVideo: objectKey } }
      );
    }

    res.status(200).json({ 
      message: "Video successfully stored in cloud object storage and cleared from ECS local cache", 
      cloudPath: objectKey 
    });

  } catch (err) {
    console.error("Cloud Storage Archiving Exception:", err.message);
    res.status(500).json({ error: "Archiving Exception: " + err.message });
  }
};
