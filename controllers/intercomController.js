const IntercomGroup = require("../models/IntercomGroup");

// Get all groups
exports.getGroups = async (req, res) => {
  const groups = await IntercomGroup.find().populate('members');
  res.json(groups);
};

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const group = await IntercomGroup.create({ name: req.body.name });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: "Group name already exists" });
  }
};

// Add a user to a group
exports.addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await IntercomGroup.findById(groupId);
  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await group.save();
  }
  const updatedGroup = await group.populate('members');
  res.json(updatedGroup);
};

// Delete group
exports.deleteGroup = async (req, res) => {
  await IntercomGroup.findByIdAndDelete(req.params.id);
  res.json({ message: "Group deleted" });
};