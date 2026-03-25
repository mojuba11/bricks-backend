const express = require("express");
const router = express.Router();
const { getFences, addFence, deleteFence } = require("../controllers/fenceController");

// @route   GET /api/fences
router.get("/", getFences);

// @route   POST /api/fences
router.post("/", addFence);

// @route   DELETE /api/fences/:id
router.delete("/:id", deleteFence);

module.exports = router;