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
const deviceRoutes = require("./routes/deviceRoutes");
const fenceRoutes = require("./routes/fenceRoutes");
const intercomRoutes = require("./routes/intercomRoutes");

/* ---------------- API ENDPOINTS ---------------- */
app.use("/api/users", userRoutes);
app.use("/api/departments", deptRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/fences", fenceRoutes);
app.use("/api/intercom", intercomRoutes);

/* ---------------- TEST & HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({ 
    status: "Online", 
    message: "BRICKS Bodycam Backend API is running...",
    db_status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    version: "1.0.1"
  });
});

/* ---------------- DATABASE CONNECTION ---------------- */
const MONGO_URI = process.env.MONGO_URI;

// Connection Options for Render/MongoDB Atlas Stability
const connectionOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
  family: 4                       // Use IPv4, skip trying IPv6
};

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGO_URI, connectionOptions)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // On Render, if DB fails initially, we let it stay up so we can check logs
  });

// Log connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error("Mongoose Runtime Error:", err);
});

/* ---------------- ERROR HANDLING ---------------- */
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BRICKS Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});