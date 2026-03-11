const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("BRICKS Backend API Running...");
});

/* ---------------- DATABASE CONNECTION ---------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BRICKS Server running on port ${PORT}`);
});