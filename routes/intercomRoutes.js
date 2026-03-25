const express = require("express");
const router = express.Router();
const { getGroups, createGroup, addUserToGroup, deleteGroup } = require("../controllers/intercomController");

// @route   GET /api/intercom
router.get("/", getGroups);

// @route   POST /api/intercom
router.post("/", createGroup);

// @route   POST /api/intercom/add-member
// Expects { groupId, userId } in body
router.post("/add-member", addUserToGroup);

// @route   DELETE /api/intercom/:id
router.delete("/:id", deleteGroup);

module.exports = router;