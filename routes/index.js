// routes/itemRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateRegister, validateLogin } = require("../controllers/userController");
// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);
router.post("/register", multer().none(), validateRegister, userController.register);
router.post("/login", multer().none(), validateLogin, userController.login);
router.get("/view_profile", userController.view_profile)
module.exports = router;
