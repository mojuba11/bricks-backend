const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors()); 
app.use(express.json()); 

/* ---------------- ROUTE IMPORTS ---------------- */
const userRoutes = require("./routes/userRoutes");
const deptRoutes = require("./routes/deptRoutes");
const deviceRoutes = require("./routes/deviceRoutes"); // Matches your router file
const fenceRoutes = require("./routes/fenceRoutes");
const intercomRoutes = require("./routes/intercomRoutes");
const videoRoutes = require("./routes/videoRoutes"); // NEW: Added for OBS Storage & GPS streams

/* ---------------- API ENDPOINTS ---------------- */
app.use("/api/users", userRoutes);
app.use("/api/departments", deptRoutes);

/** * FIXED: Changed from "/api/devices" to "/api/device" 
 * to match Frontend API_URL: https://.../api/device
 */
app.use("/api/device", deviceRoutes); // Contains CRUD + stream-start/stream-stop hooks

app.use("/api/fences", fenceRoutes);
app.use("/api/intercom", intercomRoutes);
app.use("/api/video", videoRoutes); // NEW: Dedicated ingestion endpoint for media server events

/* ---------------- TEST & HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({ 
    status: "Online", 
    message: "BRICKS Bodycam Backend API is running...",
    db_status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    version: "1.0.3" // Incremented version to track your deployment update
  });
});

/* ---------------- DATABASE CONNECTION ---------------- */
const MONGO_URI = process.env.MONGO_URI;

const connectionOptions = {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,         
  family: 4                       
};

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGO_URI, connectionOptions)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

mongoose.connection.on('error', err => {
  console.error("Mongoose Runtime Error:", err);
});

/* ---------------- ERROR HANDLING ---------------- */
// Fallback for missing routes
app.use((req, res, next) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found. Check if you used singular or plural.` 
  });
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BRICKS Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
