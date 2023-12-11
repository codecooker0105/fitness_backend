const express = require("express");
const multer = require("multer");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateRegister,
  validateLogin,
  validateClients,
  validateCreateTrainerGroup,
  validateEditTrainerGroup,
} = require("../controllers/userController");

router.post(
  "/register",
  multer().none(),
  validateRegister,
  userController.register
);
router.post("/login", multer().none(), validateLogin, userController.login);
router.get("/view_profile", userController.view_profile);
router.post(
  "/clients",
  multer().none(),
  validateClients,
  userController.clients
);
router.post(
  "/create_trainer_group",
  multer().none(),
  validateCreateTrainerGroup,
  userController.create_trainer_group
);
router.post(
  "/edit_trainer_group",
  multer().none(),
  validateEditTrainerGroup,
  userController.edit_trainer_group
);
module.exports = router;
