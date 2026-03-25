const mongoose = require("mongoose");

const fenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Circle", "Polygon"], default: "Circle" },
  coordinates: { type: Object, required: true }, // Stores GeoJSON or Lat/Lng
  radius: { type: Number }, // Only for circles
  alertEmail: { type: String },
  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Fence", fenceSchema);