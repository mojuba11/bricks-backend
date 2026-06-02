const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "30d" });
};

// --- AUTH FUNCTIONS (Required by userRoutes) ---

exports.registerUser = async (req, res) => {
  try {
    const { username, userId, email, password } = req.body;
    
    // Check fallback targets cleanly to prevent duplicate registration rows
    const identifier = userId || username;
    const existing = await User.findOne({ 
      $or: [
        { userId: identifier }, 
        { email }
      ] 
    });
    
    if (existing) return res.status(400).json({ message: "User already exists with this ID or Email" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Normalize keys to align with the underlying database model attributes
    const newUser = new User({ 
      ...req.body, 
      userId: identifier,
      password: hashedPassword 
    });
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      userId: newUser.userId,
      email: newUser.email,
      token: generateToken(newUser._id)
    });
  } catch (err) {
    res.status(400).json({ message: "Register Error: " + err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    // 1. Accept either 'username' or 'email' keys directly from your frontend login payloads
    const { username, email, password } = req.body;
    const incomingId = email || username;

    if (!incomingId || !password) {
      return res.status(400).json({ message: "Identifier credentials and password are required." });
    }

    // 2. Query both target identification slots ($or conditional routing lookup block)
    const user = await User.findOne({
      $or: [
        { email: incomingId.trim() },
        { userId: incomingId.trim() } // Successfully matches 'TEST' column properties
      ]
    });

    // 3. Cryptographically compare passwords using the database document hash
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        userId: user.userId,
        email: user.email,
        userName: user.name, // Populates your frontend localStorage item "userName" cleanly
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid identification credentials or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login Error: " + err.message });
  }
};

// --- USER MANAGEMENT FUNCTIONS ---

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const mappedUsers = users.map(user => {
      const u = user.toObject();
      return { 
        ...u, 
        userName: u.name || u.userName, 
        dept: u.dept || "Unassigned" 
      };
    });
    res.json(mappedUsers);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({ 
      $or: [
        { name: new RegExp(q, 'i') },
        { userId: new RegExp(q, 'i') }, // Replaced unaligned legacy username property search
        { email: new RegExp(q, 'i') }
      ] 
    }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { userId, email, password, userName, ...rest } = req.body;
    const existing = await User.findOne({ $or: [{ userId }, { email }] });
    if (existing) return res.status(400).json({ message: "User ID or Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      ...rest,
      userId,
      email,
      name: userName, 
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ ...newUser.toObject(), userName: newUser.name });
  } catch (err) {
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, userName, ...updateData } = req.body;
    if (userName) updateData.name = userName;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ ...updatedUser.toObject(), userName: updatedUser.name });
  } catch (err) {
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
