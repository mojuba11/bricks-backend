const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors()); // Allows your React frontend to connect
app.use(express.json()); // Parses incoming JSON requests (Critical for req.body)

/* ---------------- ROUTE IMPORTS ---------------- */
// Ensure these files exist in your /routes folder
const userRoutes = require("./routes/userRoutes");
const deptRoutes = require("./routes/deptRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const fenceRoutes = require("./routes/fenceRoutes");
const intercomRoutes = require("./routes/intercomRoutes");

/* ---------------- API ENDPOINTS ---------------- */
// All routes are prefixed to stay organized
app.use("/api/users", userRoutes);           // Login/Register
app.use("/api/departments", deptRoutes);     // Dept Management
app.use("/api/devices", deviceRoutes);       // Device Management
app.use("/api/fences", fenceRoutes);         // Fence/Map Management
app.use("/api/intercom", intercomRoutes);    // Intercom Groups & Personnel

/* ---------------- TEST & HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({ 
    status: "Online", 
    message: "BRICKS Bodycam Backend API is running...",
    version: "1.0.0"
  });
});

/* ---------------- DATABASE CONNECTION ---------------- */
// Using options for stability
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if DB fails
  });

/* ---------------- ERROR HANDLING ---------------- */
// Catch-all for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BRICKS Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});