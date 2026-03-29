const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // The 'name' field stores what the frontend calls 'userName'
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // ADD THESE FIELDS BELOW:
  userId: {
    type: String,
    required: true,
    unique: true
  },
  dept: {
    type: String,
    default: "Unassigned"
  },
  phone: {
    type: String
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    default: "Male"
  },
  role: {
    type: String,
    default: "User"
  },
  state: {
    type: String,
    default: "Enable"
  },
  deviceId: {
    type: String
  },
  remark: {
    type: String
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("User", userSchema);