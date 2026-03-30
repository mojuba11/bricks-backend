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
    if (err.code === 11000) {
      return res.status(400).json({ message: "Device ID already exists." });
    }
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// PUT update device
exports.updateDevice = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Auto-update status based on the presence of a stream URL
    if (updateData.streamUrl !== undefined) {
      updateData.status = (updateData.streamUrl && updateData.streamUrl.trim() !== "") 
        ? "Online" 
        : "Offline";
    }

    const updated = await Device.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: "Device not found" });
    res.json(updated);
  } catch (err) {
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