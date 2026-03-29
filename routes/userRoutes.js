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

// --- Auth Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- User Management Routes ---

// Matches: GET /api/users
router.get("/", getUsers); 

// Matches: GET /api/users/search
router.get("/search", searchUsers);

// Matches: POST /api/users (The "Add User" button)
router.post("/", createUser);

// Matches: PUT /api/users/:id (The "Modify" button)
router.put("/:id", updateUser);

// Matches: DELETE /api/users/:id (The "Delete" button)
router.delete("/:id", deleteUser);

module.exports = router;