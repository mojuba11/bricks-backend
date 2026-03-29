const User = require("../models/User"); 
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
    
    if (userId) query.userId = new RegExp(userId, 'i'); 
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
    const { userId, email, password, userName } = req.body;
    
    // 1. Check if user already exists
    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User ID or Email already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user object
    // CRITICAL FIX: We map 'userName' from the frontend to 'name' for the database
    const newUser = new User({
      ...req.body,
      name: userName, // This satisfies the 'name: required' validation
      password: hashedPassword
    });

    await newUser.save();

    // 4. Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);

  } catch (err) {
    // This catches the 'validation failed' error and sends it to the frontend
    res.status(400).json({ message: "Create Error: " + err.message });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Map name if userName is provided during update
    if (updateData.userName) {
      updateData.name = updateData.userName;
    }

    // Hash password if it's being changed
    if (updateData.password && updateData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      // Prevent overwriting with an empty string
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Update Error: " + err.message });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Error: " + err.message });
  }
};

// Keep your existing login/register logic below
exports.registerUser = async (req, res) => {
    // Use the same 'name: userName' logic here if your register form 
    // also uses 'userName' as the input key.
};

exports.loginUser = async (req, res) => {
    // Existing login logic
};