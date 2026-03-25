const express = require("express");
const router = express.Router();
const { getDepts, createDept, updateDept, deleteDept } = require("../controllers/deptController");

// @route   GET /api/departments
router.get("/", getDepts);

// @route   POST /api/departments
router.post("/", createDept);

// @route   PUT /api/departments/:id
router.put("/:id", updateDept);

// @route   DELETE /api/departments/:id
router.delete("/:id", deleteDept);

module.exports = router;