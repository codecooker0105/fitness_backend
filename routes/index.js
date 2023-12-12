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
  validateAddStat,
  validateMyStat,
  validateViewStat,
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
router.post("/add_stat", multer().none(), validateAddStat, userController.add_stat);
router.post("/my_stat", multer().none(), validateMyStat, userController.my_stat);
router.post("/view_stat", multer().none(), validateViewStat, userController.view_stat);
module.exports = router;
