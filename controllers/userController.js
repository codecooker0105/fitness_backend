// controllers/userController.js
const { validationResult, check, body } = require("express-validator");
const {
  getAttributes,
  getFormattedDate,
  getMonday,
  getSunday,
  getFirstDayOfMonth,
  getLastDayOfMonth,
} = require("../helper/general");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const knex = require("knex");

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
  check("first_name").notEmpty().withMessage("First Name is required."),
  check("last_name").notEmpty().withMessage("Last Name is required."),
  check("member_type").notEmpty().withMessage("Member type is required."),
  check("terms_accept").notEmpty().withMessage("Terms is required."),
  check("password").notEmpty().withMessage("Password is required."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
];

const validateHandle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

const validateLogin = [
  check("password").notEmpty().withMessage("Password is required."),
  check("username").notEmpty().withMessage("Username is required."),
];

const validateClients = [
  check("user_id").notEmpty().withMessage("User ID is required."),
];

const validateCreateTrainerGroup = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("title").notEmpty().withMessage("Title is required."),
  check("exp_level_id").notEmpty().withMessage("Experience Level is required."),
];

const validateEditTrainerGroup = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("group_id").notEmpty().withMessage("Group ID is required."),
  check("title").notEmpty().withMessage("Title is required."),
  check("exp_level_id").notEmpty().withMessage("Experience Level is required."),
];

const validateAddStat = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("title").notEmpty().withMessage("Title is required."),
  check("measurement_type")
    .notEmpty()
    .withMessage("Measurement Type is required."),
];

const validateMyStat = [
  check("user_id").notEmpty().withMessage("User ID is required."),
];

const validateViewStat = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("stat_id").notEmpty().withMessage("Stat ID is required."),
];

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

const get_clients = async (userId) => {
  const result = await db("users")
    .select(
      "trainer_clients.id",
      "users.email",
      "users.device_token",
      "trainer_clients.status",
      "meta.first_name",
      "meta.last_name",
      "meta.photo",
      "meta.user_id",
      "meta.available_equipment"
    )
    .join("trainer_clients", "users.email", "trainer_clients.email")
    .join("meta", "users.id", "meta.user_id")
    .where("trainer_clients.trainer_id", userId)
    .whereNot("trainer_clients.status", "denied");
  return JSON.parse(JSON.stringify(result));
};

const get_groups = async (userId) => {
  const result = await db("trainer_client_groups").where("trainer_id", userId);
  for (let i = 0; i < result.length; i++) {
    if (result[i].exp_level_id) {
      result[i].exp_level_name = await db("experience_level")
        .where("id", result[i].exp_level_id)
        .first();
    }
    if (result[i].available_equipment) {
      result[i].available_equipment_name = await db("equipment").whereIn(
        "id",
        result[i].available_equipment.split(",")
      );
    }
  }
  return JSON.parse(JSON.stringify(result));
};

const stat_list = async (userId) => {
  const result = await db("user_stats").where("user_id", userId);
  for (let i = 0; i < result.length; i++) {
    const starting_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken")
      .where("stat_id", result[i].id)
      .first();
    if (starting_stat) {
      result[i].starting_stat = starting_stat.stat_value;
    } else {
      result[i].starting_stat = "0";
    }
    const current_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken", "desc")
      .where("stat_id", result[i].id)
      .first();
    if (current_stat) {
      result[i].current_stat = current_stat.stat_value;
    } else {
      result[i].current_stat = "0";
    }
  }
  return JSON.parse(JSON.stringify(result));
};

const view_stat_weekly = async (stat_id) => {
  const result = await db("user_stats").where("id", stat_id);
  for (let i = 0; i < result.length; i++) {
    const starting_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken")
      .where("date_taken", ">=", getMonday())
      .where("date_taken", "<=", getSunday())
      .where("stat_id", result[i].id)
      .first();
    if (starting_stat) {
      result[i].starting_stat = starting_stat.stat_value;
    } else {
      result[i].starting_stat = "";
    }
    const current_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken", "desc")
      .where("date_taken", ">=", getMonday())
      .where("date_taken", "<=", getSunday())
      .where("stat_id", result[i].id)
      .first();
    if (current_stat) {
      result[i].current_stat = current_stat.stat_value;
    } else {
      result[i].current_stat = "";
    }
  }
  return JSON.parse(JSON.stringify(result));
};

const view_stat_monthly = async (stat_id) => {
  const result = await db("user_stats").where("id", stat_id);
  for (let i = 0; i < result.length; i++) {
    const starting_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken")
      .where("date_taken", ">=", getFirstDayOfMonth())
      .where("date_taken", "<=", getLastDayOfMonth())
      .where("stat_id", result[i].id)
      .first();
    if (starting_stat) {
      result[i].starting_stat = starting_stat.stat_value;
    } else {
      result[i].starting_stat = "";
    }
    const current_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken", "desc")
      .where("date_taken", ">=", getFirstDayOfMonth())
      .where("date_taken", "<=", getLastDayOfMonth())
      .where("stat_id", result[i].id)
      .first();
    if (current_stat) {
      result[i].current_stat = current_stat.stat_value;
    } else {
      result[i].current_stat = "";
    }
  }
  return JSON.parse(JSON.stringify(result));
};


const view_stat_normal = async (stat_id) => {
  const result = await db("user_stats").where("id", stat_id);
  for (let i = 0; i < result.length; i++) {
    const starting_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken")
      .where("stat_id", result[i].id)
      .first();
    if (starting_stat) {
      result[i].starting_stat = starting_stat.stat_value;
    } else {
      result[i].starting_stat = "";
    }
    const current_stat = await db("user_stats_values")
      .select("stat_value")
      .orderBy("date_taken", "desc")
      .where("stat_id", result[i].id)
      .first();
    if (current_stat) {
      result[i].current_stat = current_stat.stat_value;
    } else {
      result[i].current_stat = "";
    }
  }
  return JSON.parse(JSON.stringify(result));
};

const updateDevice = async (userId, updateData) => {
  await db("users").where("id", userId).update(updateData);
};

const register = async (req, res) => {
  await validateHandle(req, res);

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
  await validateHandle(req, res);

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
    await db("users")
      .where("id", user.id)
      .update("last_login", Math.floor(Date.now() / 1000));

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
    });
  }
};

const clients = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail?.group_id == 3) {
      const result = {};

      result.clients = await get_clients(userId);
      result.trainer_groups = await get_groups(userId);

      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "Trainers does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const create_trainer_group = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail?.group_id == 3) {
      const insertData = {
        title: bodyData.title,
        trainer_id: userId,
        exp_level_id: bodyData.exp_level_id,
        available_equipment: bodyData.available_equipment,
      };
      const newGroupsId = await db("trainer_client_groups").insert(insertData, [
        "id",
      ]);
      if (bodyData.clients) {
        const client_array = bodyData.clients.split(",");
        if (client_array.length > 0) {
          client_array.map(async (client) => {
            await db("trainer_clients")
              .where("client_id", client)
              .where("trainer_id", userId)
              .update("trainer_group_id", newGroupsId);
          });
        }
      }
      return res.json({
        status: 1,
        message: "New Group saved.",
      });
    } else {
      return res.json({
        status: 0,
        message: "Trainers does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const edit_trainer_group = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail?.group_id == 3) {
      const updateData = {
        title: bodyData.title,
        trainer_id: userId,
        exp_level_id: bodyData.exp_level_id,
        available_equipment: bodyData.available_equipment,
      };
      await db("trainer_client_groups")
        .where("id", bodyData.group_id)
        .update(updateData);
      await db("trainer_clients")
        .where("trainer_group_id", bodyData.group_id)
        .update("trainer_group_id", null);
      if (bodyData.clients) {
        const client_array = bodyData.clients.split(",");
        if (client_array.length > 0) {
          client_array.map(async (client) => {
            await db("trainer_clients")
              .where("client_id", client)
              .where("trainer_id", userId)
              .update("trainer_group_id", bodyData.group_id);
          });
        }
      }
      const result = {};
      result.clients = await get_clients(userId);
      result.trainer_groups = await get_groups(userId);

      return res.json({
        status: 1,
        message: "Group saved.",
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "Trainers does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const add_stat = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const insertData = {
        user_id: userId,
        title: bodyData.title,
        measurement_type: bodyData.measurement_type,
      };
      const newStatId = await db("user_stats").insert(insertData, ["id"]);
      if (bodyData.starting) {
        const newUserStatsValueData = {
          stat_id: newStatId,
          stat_value: bodyData.starting,
          date_taken: getFormattedDate(),
        };
        await db("user_stats_values").insert(newUserStatsValueData);
      }
      const result = await stat_list(userId);

      return res.json({
        status: 1,
        message: "Stat created successfully.",
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "User does not exist.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const my_stat = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const result = await stat_list(userId);

      if (result.length > 0) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No stats",
        });
      }
    } else {
      return res.json({
        status: 0,
        message: "User does not exist.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const view_stat = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      let result = null;
      if (bodyData.interval) {
        if (bodyData.interval == "weekly") {
          result = await view_stat_weekly(bodyData.stat_id);
        } else if (bodyData.interval == "monthly") {
          result = await view_stat_monthly(bodyData.stat_id);
        } else {
          result = await view_stat_normal(bodyData.stat_id);
        }
      } else {
        result = await view_stat_normal(bodyData.stat_id);
      }

      if (result.length > 0) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No stats",
        });
      }
    } else {
      return res.json({
        status: 0,
        message: "User does not exist.",
      });
    }
  } catch (e) {
    console.log(e);
  }
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
  validateLogin,
  validateClients,
  validateCreateTrainerGroup,
  validateEditTrainerGroup,
  validateAddStat,
  validateMyStat,
  validateViewStat,
  getAllUsers,
  getUserById,
  register,
  updateUser,
  deleteUser,
  login,
  view_profile,
  clients,
  create_trainer_group,
  edit_trainer_group,
  add_stat,
  my_stat,
  view_stat,
};
