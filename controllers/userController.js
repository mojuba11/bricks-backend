const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Ensure you have jwt installed

// Helper to generate JWT (Match this with your secret in .env)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

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
    if (userId) query.userId = new RegExp(userId, 'i'); 
    if (dept) query.dept = dept;

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search Error: " + err.message });
  }
};

// @desc    Create/Add new user (Admin Panel)
exports.createUser = async (req, res) => {
  try {
    const { userId, email, password, userName } = req.body;
    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) return res.status(400).json({ message: "User ID or Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      ...req.body,
      name: userName, // Map frontend userName to backend name
      password: hashedPassword
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.userName) updateData.name = updateData.userName;

    if (updateData.password && updateData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Error: " + err.message });
  }
};

// @desc    Register User (Public)
exports.registerUser = async (req, res) => {
  try {
    const { userId, email, password, userName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      userId,
      email,
      name: userName, // Ensure registration also maps the name correctly
      password: hashedPassword,
      ...req.body
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userId: user.userId,
        userName: user.name, // Return as userName for frontend state
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        userId: user.userId,
        userName: user.name, // Important: Frontend expects 'userName'
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login Error: " + err.message });
  }
};