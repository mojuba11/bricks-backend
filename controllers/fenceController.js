const Fence = require("../models/Fence");

exports.getFences = async (req, res) => {
  try {
    const fences = await Fence.find();
    res.json(fences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFence = async (req, res) => {
  try {
    const newFence = await Fence.create(req.body);
    res.status(201).json(newFence);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFence = async (req, res) => {
  try {
    await Fence.findByIdAndDelete(req.params.id);
    res.json({ message: "Fence deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};