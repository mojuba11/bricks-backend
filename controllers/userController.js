const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const mappedUsers = users.map(user => {
      const u = user.toObject();
      return { ...u, userName: u.name, dept: u.dept || "Unassigned" };
    });
    res.json(mappedUsers);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// CREATE USER
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

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { password, userName, ...updateData } = req.body;
    
    // Map userName back to name for DB
    if (userName) updateData.name = userName;

    // Only update password if provided
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

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};