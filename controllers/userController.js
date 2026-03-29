const User = require("../models/User"); // Adjust path to your User model if needed
const bcrypt = require("bcryptjs");

// @desc    Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// @desc    Search/Filter users
exports.searchUsers = async (req, res) => {
  try {
    const { userId, dept } = req.query;
    let query = {};
    
    if (userId) query.userId = new RegExp(userId, 'i'); // Case-insensitive partial match
    if (dept) query.dept = dept;

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search Error: " + err.message });
  }
};

// @desc    Create/Add new user
exports.createUser = async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) return res.status(400).json({ message: "User ID or Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      ...req.body,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    ).select("-password");
    
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Error: " + err.message });
  }
};

// --- Keep your existing Register/Login logic below ---
exports.registerUser = async (req, res) => { /* your existing code */ };
exports.loginUser = async (req, res) => { /* your existing code */ };