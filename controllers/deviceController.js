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

// POST new device (With Duplicate ID Check)
exports.addDevice = async (req, res) => {
  try {
    const newDevice = new Device(req.body);
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (err) {
    // Catch duplicate Device ID error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Device ID already exists. Please use a unique ID." 
      });
    }
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// PUT update device
exports.updateDevice = async (req, res) => {
  try {
    const updated = await Device.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

// DELETE device
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Device not found" });
    }
    res.json({ message: "Device deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Error: " + err.message });
  }
};