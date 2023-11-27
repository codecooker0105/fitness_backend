// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateRegister } = require("../controllers/userController");
// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);
router.post("/register", validateRegister, userController.createUser);

module.exports = router;
