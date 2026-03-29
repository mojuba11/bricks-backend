const express = require("express");
const router = express.Router();
const { 
  getUsers, 
  searchUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  registerUser,
  loginUser
} = require("../controllers/userController");

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User Management Routes
router.get("/", getUsers); 
router.get("/search", searchUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;