const mongoose = require("mongoose");

const intercomSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: String }], // Array of user IDs or names
  description: { type: String },
  priority: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Intercom", intercomSchema);