// controllers/userController.js
const userModel = require('../models/userModel');

const getAllUsers = (req, res) => {
  userModel.getAllUsers((users) => {
    res.json(users);
  });
};

const getUserById = (req, res) => {
  const userId = req.params.id;
  userModel.getUserById(userId, (user) => {
    res.json(user);
  });
};

const createUser = (req, res) => {
  const newUser = req.body;
  userModel.createUser(newUser, (userId) => {
    res.json({ id: userId });
  });
};

const updateUser = (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  userModel.updateUser(userId, updatedUser, () => {
    res.sendStatus(200);
  });
};

const deleteUser = (req, res) => {
  const userId = req.params.id;
  userModel.deleteUser(userId, () => {
    res.sendStatus(200);
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
