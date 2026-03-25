const Department = require("../models/Department");

exports.getDepts = async (req, res) => {
  const depts = await Department.find();
  res.json(depts);
};

exports.createDept = async (req, res) => {
  const newDept = await Department.create(req.body);
  res.status(201).json(newDept);
};

exports.updateDept = async (req, res) => {
  const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.deleteDept = async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};