// controllers/userController.js
const userModel = require("../models/userModel");
const { validationResult, check } = require("express-validator");

const validateRegister = [
  check("first_name").notEmpty().withMessage("First Name is required"),
  check("last_name").notEmpty().withMessage("Last Name is required"),
  check("member_type").notEmpty().withMessage("Member type is required"),
  check("terms_accept").notEmpty().withMessage("Terms is required"),
  check("password").notEmpty().withMessage("Password is required"),
  check("email").notEmpty().withMessage("Email is required"),
];

const validateHandleRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

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

const createUser = async (req, res) => {
  await validateHandleRegister(req, res);

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
    res.json("successfully deleted");
  });
};

module.exports = {
  validateRegister,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
