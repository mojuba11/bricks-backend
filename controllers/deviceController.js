const Device = require("../models/Device");

// GET all devices (Sorted by newest first)
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error: " + err.message });
  }
};

// POST new device
exports.addDevice = async (req, res) => {
  try {
    const deviceData = { ...req.body };

    // Logic: If streamUrl exists, mark as Online
    if (deviceData.streamUrl && deviceData.streamUrl.trim() !== "") {
      deviceData.status = "Online";
    } else {
      deviceData.status = "Offline";
    }

    const newDevice = new Device(deviceData);
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (err) {
    // Catch Duplicate Device ID Error
    if (err.code === 11000) {
      return res.status(400).json({ message: "Device ID already exists." });
    }
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// PUT update device (SLOT FIX KEPT HERE)
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // DEBUG: This will show in your Render logs
    console.log(`Backend received update for ${id}:`, updateData);

    // Auto-update status based on the presence of a stream URL
    if (updateData.streamUrl !== undefined) {
      updateData.status = (updateData.streamUrl && updateData.streamUrl.trim() !== "") 
        ? "Online" 
        : "Offline";
    }

    // Force findByIdAndUpdate to use $set so it specifically targets the 'slot' field
    const updated = await Device.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Device not found" });
    }

    console.log("Device updated successfully:", updated.deviceName, "Slot:", updated.slot);
    res.json(updated);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

// DELETE device
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Device not found" });
    res.json({ message: "Device deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Error: " + err.message });
  }
};

// =========================================================================
// NEW WEBHOOK CODES BELOW: LINKED DIRECTLY TO THE LIVE STREAMING SERVER
// =========================================================================

// Webhook: Fired when streaming gateway signals an active connection from a bodycam
exports.setDeviceOnline = async (req, res) => {
  try {
    const { deviceId, playUrl } = req.body; 

    if (!deviceId) {
      return res.status(400).json({ message: "Missing required deviceId payload parameter" });
    }

    const updated = await Device.findOneAndUpdate(
      { deviceId }, // Uses hardware identity attribute
      { $set: { status: "Online", streamUrl: playUrl } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: `Streaming device matching Device ID ${deviceId} not registered in DB` });
    }

    console.log(`Live Stream Signal Hook: ${updated.deviceName} is now active.`);
    res.json({ message: "Device marked Online successfully", device: updated });
  } catch (err) {
    console.error("Stream Online Webhook Error:", err.message);
    res.status(500).json({ message: "Server Stream Hook Error: " + err.message });
  }
};

// Webhook: Fired when streaming gateway detects a physical drop/cutoff
exports.setDeviceOffline = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: "Missing required deviceId payload parameter" });
    }

    const updated = await Device.findOneAndUpdate(
      { deviceId },
      { $set: { status: "Offline" } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: `Device ID ${deviceId} not found` });
    }

    console.log(`Disconnected Stream Hook: ${updated.deviceName} changed status to Offline.`);
    res.json({ message: "Device marked Offline successfully", device: updated });
  } catch (err) {
    console.error("Stream Offline Webhook Error:", err.message);
    res.status(500).json({ message: "Server Stream Hook Error: " + err.message });
  }
};
