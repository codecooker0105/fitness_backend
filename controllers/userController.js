// controllers/userController.js
const { validationResult, check, body } = require("express-validator");
const { getAttributes } = require("../helper/general");
const db = require("../config/db");
const bcrypt = require("bcrypt");

const metaTableFields = [
  "user_id",
  "first_name",
  "last_name",
  "city",
  "state",
  "zip",
  "phone_number",
  "photo",
  "progression_plan_id",
  "exp_level_id",
  "available_equipment",
  "workouts",
  "progression_plan_day",
  "tos_agreement",
];

const userTableFields = [
  "group_id",
  "ip_address",
  "username",
  "password",
  "salt",
  "email",
  "activation_code",
  "forgotten_password_code",
  "remember_code",
  "mobile_api",
  "device_type",
  "device_token",
];
const validateRegister = [
  check("first_name").notEmpty().withMessage("First Name is required"),
  check("last_name").notEmpty().withMessage("Last Name is required"),
  check("member_type").notEmpty().withMessage("Member type is required"),
  check("terms_accept").notEmpty().withMessage("Terms is required"),
  check("password").notEmpty().withMessage("Password is required"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
];

const validateHandleRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

const validateLogin = [
  check("password").notEmpty().withMessage("Password is required"),
  check("username").notEmpty().withMessage("username is required"),
];

const validateHandleLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await db("users");
    return res.json(users);
  } catch (e) {
    console.log(e);
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const userById = await db("users").where("id", userId);
    return res.json(userById);
  } catch (e) {
    console.log(e);
  }
};

const getUserDetail = async (userId) => {
  const result = await db("users")
    .select(
      "users.id",
      "users.group_id",
      "users.username",
      "users.email",
      "users.active",
      "users.device_type",
      "users.device_token",
      "groups.name as group_name",
      "groups.description as group_description",
      "meta.first_name",
      "meta.last_name",
      "meta.phone_number",
      "meta.city",
      "meta.state",
      "meta.zip",
      "meta.photo",
      "meta.progression_plan_id",
      "meta.progression_plan_day",
      "meta.exp_level_id",
      "meta.available_equipment",
      "meta.workoutdays",
      "meta.tos_agreement"
    )
    .join("meta", "users.id", "meta.user_id")
    .join("groups", "users.group_id", "groups.id")
    .where("users.id", userId);
  return result[0];
};

const updateDevice = async (userId, updateData) => {
  await db("users").where("id", userId).update(updateData);
};

const register = async (req, res) => {
  await validateHandleRegister(req, res);

  try {
    const userData = JSON.parse(JSON.stringify(req.body));
    const newUserData = getAttributes(userData, userTableFields);

    // check existing user
    const existingUser = await db("users").where("email", newUserData.email);
    if (existingUser.length > 0) {
      return res.json({ status: 0, message: "This user already exists." });
    }

    // insert data to user table
    const group_name = ["members", "trainers"].includes(userData.member_type)
      ? userData.member_type
      : "members";
    const group_id = await db("groups").where("name", group_name).select("id");
    newUserData.group_id = group_id[0].id;
    newUserData.username = userData.email;
    newUserData.password = await bcrypt.hash(userData.password, 10);
    newUserData.active = 1;
    newUserData.created_on = Math.floor(Date.now() / 1000);
    newUserData.last_login = Math.floor(Date.now() / 1000);
    const newUserId = await db("users").insert(newUserData, ["id"]);

    // insert data to meta table
    const newUserMetaData = getAttributes(userData, metaTableFields);
    newUserMetaData.user_id = newUserId[0];
    await db("meta").insert(newUserMetaData);

    // get user details
    const userDetail = await getUserDetail(newUserId[0]);
    return res.json({
      status: 1,
      message: "Your account has been created",
      data: userDetail,
    });
  } catch (e) {
    console.log(e);
  }
};

const login = async (req, res) => {
  await validateHandleLogin(req, res);

  try {
    const userData = JSON.parse(JSON.stringify(req.body));

    const user = await db("users").where("username", userData.username).first();
    const compareResult = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!compareResult) {
      return res.json({ status: 0, message: "In-Correct Login." });
    }

    // update device_token and login time
    const updateDeviceData = {
      device_token: user.device_token,
      device_type: user.device_type,
    };
    if (userData?.device_token) {
      updateDeviceData.device_token = userData.device_token;
    }
    if (userData?.device_type) {
      updateDeviceData.device_type = userData.device_type;
    }
    await updateDevice(user.id, updateDeviceData);
    await db("users").where("id", user.id).update('last_login', Math.floor(Date.now() / 1000));

    // get user detail
    const userDetail = await getUserDetail(user.id);
    return res.json({
      status: 1,
      message: "You Are Login Successfully",
      data: userDetail,
    });
  } catch (e) {
    console.log(e);
  }
};

const view_profile = async (req, res) => {
  const userId = req.query.user_id;
  // get user detail
  const userDetail = await getUserDetail(userId);
  if (userDetail) {
    return res.json({
      status: 1,
      data: userDetail,
    });
  } else {
    return res.json({
      status: 0,
      message: "No Such User Exist",
    })
  }
  
}

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
  validateLogin,
  getAllUsers,
  getUserById,
  register,
  updateUser,
  deleteUser,
  login,
  view_profile,
};
