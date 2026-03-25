const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  superiorDept: { type: String },
  deptNumber: { type: String },
  saveTime: { type: String, default: "Forever" },
  remark: { type: String },
  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);