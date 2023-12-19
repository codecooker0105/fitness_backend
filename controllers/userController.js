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

const validateAddFeaturedExerciseToWorkout = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("exercise").notEmpty().withMessage("Exercise is required."),
  check("workout_id").notEmpty().withMessage("Workout ID is required."),
  check("choice").notEmpty().withMessage("Choice is required."),
];

const validateGetSimiliarWorkoutExercise = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("exercise").notEmpty().withMessage("Exercise is required."),
  check("workout_id").notEmpty().withMessage("Workout ID is required."),
];

const validateAddCurrentStat = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("stat_id").notEmpty().withMessage("Stat ID is required."),
  check("date_taken").notEmpty().withMessage("Date taken is required."),
  check("stat_value").notEmpty().withMessage("Stat value is required."),
];

const validateRemoveStat = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("stat_id").notEmpty().withMessage("Stat ID is required."),
];

const validateDeleteWorkout = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("id").notEmpty().withMessage("Workout ID is required."),
];

const validateConfirmTrainerRequest = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("request_id").notEmpty().withMessage("Request ID is required."),
  check("decision").notEmpty().withMessage("Decision is required."),
];

const validateEditProgressionPlan = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("progression_plan_id")
    .notEmpty()
    .withMessage("Progression Plan ID is required."),
  check("workoutdays").notEmpty().withMessage("Workout Days are required."),
];

const validateChangePassword = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("old_password").notEmpty().withMessage("Old password is required."),
  check("new_password").notEmpty().withMessage("New password is required."),
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

const overall_workouts = async (userId, page, limit) => {
  const result = await db("user_workouts")
    .select(
      "user_workouts.id",
      "user_workouts.title",
      "user_workouts.workout_date",
      "user_workouts.trainer_workout_id",
      "user_workouts.workout_created",
      "trainer_workouts.user_id as client_id",
      "CONCAT((meta.first_name),(' '),( meta.last_name)) AS trainer_name"
    )
    .join(
      "trainer_workouts",
      "trainer_workouts.id",
      "user_workouts.trainer_workout_id"
    )
    .join("users", "trainer_workouts.trainer_id", "users.id")
    .join("meta", "meta.user_id", "users.id")
    .where("user_workouts.user_id", userId)
    .orderBy("workout_date", "desc")
    .orderBy("user_workouts.id", "desc")
    .limit(limit, (page - 1) * limit);
  return JSON.parse(JSON.stringify(result));
};

const client_overall_workouts = async (userId, page, limit) => {
  const result = await db("user_workouts")
    .select(
      "user_workouts.id",
      "user_workouts.title",
      "user_workouts.workout_date",
      "user_workouts.trainer_workout_id",
      "user_workouts.workout_created",
      "trainer_workouts.user_id as client_id",
      "CONCAT((meta.first_name),(' '),( meta.last_name)) AS trainer_name"
    )
    .join(
      "trainer_workouts",
      "trainer_workouts.id",
      "user_workouts.trainer_workout_id"
    )
    .join("users", "trainer_workouts.trainer_id", "users.id")
    .join("meta", "meta.user_id", "users.id")
    .where("trainer_workouts.user_id", userId)
    .orderBy("workout_date", "desc")
    .orderBy("user_workouts.id", "desc")
    .limit(limit, (page - 1) * limit);
  return JSON.parse(JSON.stringify(result));
};

const get_monthly_workouts = async (month, year, userId) => {
  const lastDay = new Date(year, month + 1, 0);
  const lastDayOfMonth = String(lastDay.getDate()).padStart(2, "0");
  const result = await db("user_workouts")
    .select(
      "user_workouts.id",
      "user_workouts.title",
      "user_workouts.workout_date",
      "user_workouts.trainer_workout_id",
      "user_workouts.workout_created",
      "trainer_workouts.user_id as client_id",
      "CONCAT((meta.first_name),(' '),( meta.last_name)) AS trainer_name"
    )
    .join(
      "trainer_workouts",
      "trainer_workouts.id",
      "user_workouts.trainer_workout_id"
    )
    .join("users", "trainer_workouts.trainer_id", "users.id")
    .join("meta", "meta.user_id", "users.id")
    .where("trainer_workouts.user_id", userId)
    .where("workout_date", ">=", year + "-" + month + "-01 00:00:00")
    .where(
      "workout_date",
      "<=",
      year + "-" + month + "-" + lastDayOfMonth + " 23:59:59"
    )
    .orderBy("workout_date", "desc")
    .orderBy("user_workouts.id", "desc");
  return JSON.parse(JSON.stringify(result));
};

const get_trainer_additional_video = async (trainerId, exerciseId) => {
  const result = await db("additional_exercise_videos")
    .select("mobile_video")
    .where("trainer_id", trainerId)
    .where("exercise_id", exerciseId)
    .where("priority", 1);
  if (result) {
    return JSON.parse(JSON.stringify(result.mobile_video));
  } else {
    return '';
  }
};

const get_logbook_workout = async (userId, date, workout_id) => {
  let workout = null;
  if (workout_id) {
    workout = await db("user_workouts")
      .select([
        "user_workouts.*",
        "trainer_workouts.trainer_id",
        "trainer_workouts.start_date",
        "trainer_workouts.end_date",
      ])
      .join(
        "trainer_workouts",
        "trainer_workouts.id",
        "user_workouts.trainer_workout_id"
      )
      .where("user_workouts.id", workout_id)
      .where("user_workouts.user_id", userId);
  } else {
    workout = await db("user_workouts")
      .select([
        "user_workouts.*",
        "trainer_workouts.trainer_id",
        "trainer_workouts.start_date",
        "trainer_workouts.end_date",
      ])
      .join(
        "trainer_workouts",
        "trainer_workouts.id",
        "user_workouts.trainer_workout_id"
      )
      .where("user_workouts.workout_date", date)
      .where("user_workouts.user_id", userId)
      .orderBy("user_workouts.id", "desc");
  }
  if (!workout) {
    workout = await db("user_workouts")
      .select([
        "user_workouts.*",
        "trainer_workouts.trainer_id",
        "trainer_workouts.start_date",
        "trainer_workouts.end_date",
      ])
      .join(
        "trainer_workouts",
        "trainer_workouts.id",
        "user_workouts.trainer_workout_id"
      )
      .where("user_workouts.workout_date", date)
      .where("trainer_workouts.user_id", userId)
      .orderBy("user_workouts.id", "desc");
    return JSON.parse(JSON.stringify(workout));
  } else {
    const return_workout = {
      title: workout.title,
      workout_id: workout.id,
      user_id: workout.user_id,
      trainer_workout_id: workout.trainer_workout_id,
      trainer_group_id: workout.trainer_group_id,
      trainer_id: workout.trainer_id ? workout.trainer_id : "",
      workout_date: workout.workout_date,
      start_date: workout.start_date,
      end_date: workout.end_date,
      completed: workout.completed,
      created: workout.workout_created,
      sections: [],
    };
    const workout_sections = await db("user_workout_sections")
      .select(["user_workout_sections.*", "skeleton_section_types.title"])
      .join(
        "skeleton_section_types",
        "skeleton_section_types.id",
        "user_workout_sections.section_type_id"
      )
      .where("workout_id", workout_id)
      .orderBy("display_order", "asc");
    workout_sections.forEach(async (section) => {
      return_workout.sections[section.display_order] = {
        title: section.title,
        section_rest: section.section_rest,
        exercises: [],
      };
      const workout_exercises = await db("user_workout_exercises")
        .select([
          "exercises.title",
          "exercises.mobile_video",
          "exercises.type",
          "exercise_types.title as type_title",
          "exercise_types.inserted_as",
          "user_workout_exercises.*",
        ])
        .join(
          "exercise_types",
          "exercise_types.id",
          "user_workout_exercises.exercise_type_id"
        )
        .join("exercises", "exercises.id", "user_workout_exercises.exercise_id")
        .where("workout_id", workout_id)
        .where("workout_section_id", section.id)
        .orderBy("display_order", "asc");
      workout_exercises.forEach((exercise) => {
        return_workout.sections[section.display_order].exercises[
          exercise.display_order
        ] = {
          type_title: exercise.type_title,
          id: exercise.exercise_id,
          uwe_id: exercise.id,
          title: exercise.title,
          mobile_video: exercise.mobile_video,
          sets: exercise.sets,
          reps: exercise.reps,
          time: exercise.time,
          rest: exercise.rest,
          weight: exercise.weight,
          set_type: exercise.set_type,
          weight_option: exercise.weight_option,
        };
        if (return_workout.trainer_id && return_workout !== "") {
          const additional_video = get_trainer_additional_video(
            return_workout.trainer_id,
            exercise.exercise_id
          );
          if (additional_video) {
            return_workout.sections[section.display_order].exercises[
              exercise.display_order
            ].mobile_video = additional_video;
          }
          return_workout.sections[section.display_order].exercises[
            exercise.display_order
          ].trainer_exercise = "";
        }
      });
      return_workout.sections[section.display_order].exercises =
        return_workout.sections[section.display_order].exercises.sort(
          (a, b) => a.display_order - b.display_order
        );
    });
    return_workout.sections = return_workout.sections.sort(
      (a, b) => a.display_order - b.display_order
    );
    return JSON.parse(JSON.stringify(return_workout));
  }
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
      device_token: userData?.device_token
        ? userData.device_token
        : user.device_token,
      device_type: userData?.device_type
        ? userData.device_type
        : user.device_type,
    };
    await updateDevice(user.id, updateDeviceData);
    await db("users")
      .where("id", user.id)
      .update("last_login", Math.floor(Date.now() / 1000));

    // get user detail
    const userDetail = await getUserDetail(user.id);
    return res.json({
      status: 1,
      message: "You login Successfully",
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

const add_featured_exercise_to_workout = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const choice = bodyData.choice;
      if (choice == "add_to_section") {
        const uwsId = bodyData.uws;
        if (uwsId) {
          const exercise = await db("exercises")
            .join(
              "exercise_link_types elt",
              "elt.exercise_id = exercises.id",
              "left"
            )
            .where("id", bodyData.exercise)
            .first();
          const currentSectionExercise = await db("user_workout_exercises")
            .order_by("display_order", "desc")
            .where("workout_section_id", uwsId)
            .first();
          if (currentSectionExercise) {
            const newExercise = currentSectionExercise;
            newExercise.id = null;
            newExercise.exercise_id = bodyData.exercise;
            newExercise.exercise_type_id = exercise.type_id;
            newExercise.set_type = exercise.type;
            newExercise.weight_option = exercise.weight_type;
            newExercise.display_order = newExercise.display_order + 1;
            await db("user_workout_exercises").insert(newExercise);
            return res.json({
              status: 1,
              message: "Exercise added to workout successfully.",
            });
          }
        }
      } else if (choice == "replace") {
        const uweId = bodyData.uwe;
        if (uweId) {
          const exercise = await db("exercises")
            .join(
              "exercise_link_types elt",
              "elt.exercise_id = exercises.id",
              "left"
            )
            .where("id", bodyData.exercise)
            .first();
          const currentSectionExercise = await db("user_workout_exercises")
            .order_by("display_order", "desc")
            .where("id", uweId)
            .first();
          if (currentSectionExercise) {
            const newExercise = currentSectionExercise;
            newExercise.exercise_id = bodyData.exercise;
            newExercise.exercise_type_id = exercise.type_id;
            newExercise.set_type = exercise.type;
            newExercise.weight_option = exercise.weight_type;
            newExercise.display_order = newExercise.display_order + 1;
            await db("user_workout_exercises")
              .where("id", uweId)
              .update(newExercise);
            return res.json({
              status: 1,
              message: "Exercise replaced to workout successfully.",
            });
          }
        }
      }
      return res.json({
        status: 0,
        message: "Unable to add to workout",
      });
    } else {
      return res.json({
        status: 0,
        message: "Member does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const get_similiar_workout_exercises = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const result = {};
      result.section = await db("user_workout_sections")
        .select(
          "user_workout_sections.id",
          "skeleton_section_types.title as section_title"
        )
        .join(
          "skeleton_section_types",
          "user_workout_sections.section_type_id = skeleton_section_types.id"
        )
        .where("user_workout_sections.workout_id", bodyData.workout_id)
        .order_by("display_order", "asc");
      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "Member does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const add_current_stat = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const stat = await db("user_stats")
        .where("id", bodyData.stat_id)
        .where("user_id", userId);
      if (stat) {
        const statValue = await db("user_stats_values")
          .where("stat_id", bodyData.stat_id)
          .where("date_taken", new Date(bodyData.date_taken));
        if (statValue) {
          await db("user_stats_values")
            .where("id", statValue[0].id)
            .update("stat_value", bodyData.stat_value);
        } else {
          const insertData = {
            stat_value: bodyData.stat_value,
            stat_id: bodyData.stat_id,
            date_taken: new Date(bodyData.date_taken),
          };
          await db("user_stats_values").insert(insertData);
        }
      }
      const result = await view_stat_normal(bodyData.stat_id);
      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "Member does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const remove_stat = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      await db("user_stats")
        .where("user_id", userId)
        .where("id", bodyData.stat_id)
        .del();
      await db("user_stats_values").where("stat_id", bodyData.stat_id).del();
      const result = await view_stat_normal(bodyData.stat_id);
      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "Member does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const delete_workout = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const workouts = await db("user_workouts")
        .where("id", bodyData.id)
        .select("trainer_workout_id");
      await db("trainer_workouts")
        .where("id", workouts[0].trainer_workout_id)
        .del();
      await db("user_workouts").where("id", bodyData.id).del();
      return res.json({
        status: 1,
        message: "Workout deleted successfully.",
      });
    } else {
      return res.json({
        status: 0,
        message: "Trainer does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const save_log_stats = async (req, res) => {
  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const workout_date = bodyData.workout_date;
    const exercise_id = bodyData.exercise_id;
    const uw_id = bodyData.uw_id;
    const uwe_id = bodyData.uwe_id;
    const sets = bodyData.sets;
    const reps = bodyData.reps;
    const weight = bodyData.weight;
    const time = bodyData.time;
    const difficulty = bodyData.difficulty;

    await db("user_workout_stats")
      .where("user_id", userId)
      .where("uw_id", bodyData.uw_id)
      .where("uwe_id", bodyData.uwe_id)
      .del();
    sets.map(async (set) => {
      const set_weight = weight[set] ? weight[set] : null;
      const set_time = time[set] ? time[set] : null;
      const rep = reps[set] ? reps[set] : null;
      const insertData = {
        uw_id: uw_id,
        uwe_id: uwe_id,
        workout_date: workout_date,
        exercise_id: exercise_id,
        user_id: userId,
        difficulty: difficulty,
        set: set,
        weight: set_weight,
        time: set_time,
        rep: rep,
      };
      await db("user_workout_stats").insert(insertData);
    });
  } catch (e) {
    console.log(e);
  }
};

const get_all_workout = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const page = bodyData.page ? bodyData.page : 1;
      const limit = bodyData.limit ? bodyData.limit : 1000000;
      const result = await overall_workouts(userId, page, limit);
      if (result) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No exercise found",
        });
      }
    } else {
      return res.json({
        status: 0,
        message: "Trainer does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const confirm_trainer_request = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const trainerId = bodyData.request_id;

    const userDetail = await getUserDetail(userId);
    const trainerDetail = await getUserDetail(trainerId);
    if (userDetail && userDetail.group_id == 2) {
      const decision = bodyData.decision;
      if (decision == "true") {
        await db("trainer_clients")
          .where("id", trainerId)
          .where("client_id", userId)
          .update({ status: "confirmed" });
        // need to add apn
        return res.json({
          status: 1,
          message: "Request confirmed successfully.",
          data: trainerDetail.device_token,
        });
      } else {
        await db("trainer_clients")
          .where("id", trainerId)
          .where("client_id", userId)
          .update({ status: "denied" });
        // need to add apn
        return res.json({
          status: 1,
          message: "Request denied successfully.",
        });
      }
    } else {
      return res.json({
        status: 0,
        message: "Member does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const edit_progression_plan = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const progression_plan = await db("progression_plans")
      .where("id", bodyData.progression_plan_id)
      .first();
    const workoutdays = bodyData.workoutdays.split(",");
    if (progression_plan.days_week != workoutdays.length) {
      return res.json({
        status: 0,
        message:
          "You must select " +
          progression_plan.days_week +
          " days a week for the " +
          progression_plan.title +
          " Plan.",
      });
    }
    const userDetail = await getUserDetail(userId);
    const updateData = {
      progression_plan_id: bodyData.progression_plan_id,
      workoutdays: bodyData.workoutdays,
    };
    await db("meta").where("user_id", userDetail.id).update(updateData);
    // need to add progression change
    return res.json({
      status: 1,
      message: "Progression Plan updated successfully.",
      data: userDetail,
    });
  } catch (e) {
    console.log(e);
  }
};

const calendar = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    const result = {
      user: userDetail,
      workouts: [],
    };
    let workouts = null;
    if (userDetail && userDetail.group_id == 3) {
      workouts = await overall_workouts(userId, 1, 10000000);
    } else {
      workouts = await client_overall_workouts(userId, 1, 10000000);
    }
    const uniqueWorkout = {};

    workouts.forEach((workout) => {
      if (workout.title === "") {
        workout.title = "Workout";
      }

      if (workout.trainer_workout_id && !uniqueWorkout[workout.workout_date]) {
        uniqueWorkout[workout.workout_date] = workout;
        result.workouts.push(workout);
      }
    });

    return res.json({
      status: 1,
      data: result,
    });
  } catch (e) {
    console.log(e);
  }
};

const calendar_per_month = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    const now = new Date();
    const month = bodyData.month ? bodyData.month : now.getMonth() + 1;
    const year = bodyData.year ? bodyData.year : now.getFullYear();

    const result = {
      user: userDetail,
      workouts: [],
      progression_plan: [],
    };

    const uniqueWorkout = {};
    let workouts = await get_monthly_workouts(month, year, userId);

    workouts.forEach((workout) => {
      if (workout.title === "") {
        workout.title = "Workout";
      }

      if (workout.trainer_workout_id && !uniqueWorkout[workout.workout_date]) {
        uniqueWorkout[workout.workout_date] = workout;
        result.workouts.push(workout);
      } else if (!workout.trainer_workout_id) {
        result.progression_plan.push(workout);
      }
    });

    return res.json({
      status: 1,
      data: result,
    });
  } catch (e) {
    console.log(e);
  }
};

const log_book = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const now = new Date();
    const date = bodyData.date
      ? bodyData.date
      : now.getFullYear + "-" + (now.getMonth + 1) + "-" + now.getDate();
    const workout = bodyData.workout_id
      ? get_logbook_workout(userId, "", bodyData.workout_id)
      : get_logbook_workout(userId, date, bodyData.workout_id);
    if (workout) {
      const updateDeviceData = {
        device_token: bodyData?.device_token
          ? bodyData.device_token
          : user.device_token,
        device_type: bodyData?.device_type
          ? bodyData.device_type
          : user.device_type,
      };
      await updateDevice(userId, updateDeviceData);
      let uwe = {};

      if (workout.created === "true") {
        workout.sections.forEach((section) => {
          if (section.exercises) {
            section.exercises.forEach((exercise) => {
              const uweId = exercise.uwe_id;
              if (!uwe[uweId]) {
                uwe[uweId] = {
                  uwe_id: uweId,
                  sets: [],
                  reps: [],
                  time: [],
                  weight: [],
                  difficulty: 2,
                };
              }

              const exSets = exercise.sets.split("|");
              const exWeight = exercise.weight.split("|");

              exSets.forEach(async (set, index) => {
                const saveStats = await db("user_workout_stats")
                  .select("*")
                  .where("uwe_id", uweId)
                  .where("set", set)
                  .first();

                let weight = null;

                if (saveStats) {
                  weight = saveStats.weight;
                } else if (exWeight[index] !== undefined) {
                  weight = exWeight[index];
                }

                uwe[uweId].sets.push(set);

                if (exercise.set_type === "sets_reps") {
                  uwe[uweId].reps.push(exercise.reps);
                } else if (exercise.set_type === "sets_time") {
                  uwe[uweId].time.push(exercise.time);
                }

                if (exercise.weight_option === "weighted") {
                  uwe[uweId].weight.push(weight);
                }
              });
            });
          }
        });

        workout.uwe = btoa(JSON.stringify(uwe)); // Encode to base64
      }
      return res.json({
        status: 1,
        data: workout,
      });
    } else {
      return res.json({
        status: 0,
        message: "No workout found.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const change_password = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const compareResult = await bcrypt.compare(
        bodyData.old_password,
        userDetail.password
      );
      if (!compareResult) {
        return res.json({ status: 0, message: "In-Correct password." });
      }
      const updateData = {
        password: await bcrypt.hash(bodyData.new_password, 10),
        remember_code: ''
      }
      await db("users").where("id", userId).update(updateData);
      return res.json({
        status: 1,
        message: "Password updated successfully.",
      });
    } else {
      return res.json({
        status: 0,
        message: "User does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const edit_account = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const updateData = {
        first_name: bodyData.first_name ? bodyData.first_name : userDetail.first_name,
        last_name: bodyData.last_name ? bodyData.last_name : userDetail.last_name,
        city: bodyData.city ? bodyData.city : userDetail.city,
        state: bodyData.state ? bodyData.state : userDetail.state,
        zip: bodyData.zip ? bodyData.zip : userDetail.zip,
        phone_number: bodyData.phone_number ? bodyData.phone_number : userDetail.phone_number
      }
      //image upload
      await db("meta").where("id", userId).update(updateData);
      return res.json({
        status: 1,
        message: "User profile updated successfully.",
      });
    } else {
      return res.json({
        status: 0,
        message: "User does not exist with given ID.",
      });
    }
  } catch (e) {
    console.log(e);
  }
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
  validateAddFeaturedExerciseToWorkout,
  validateGetSimiliarWorkoutExercise,
  validateAddCurrentStat,
  validateRemoveStat,
  validateDeleteWorkout,
  validateConfirmTrainerRequest,
  validateEditProgressionPlan,
  validateChangePassword,
  getAllUsers,
  getUserById,
  register,
  login,
  view_profile,
  clients,
  create_trainer_group,
  edit_trainer_group,
  add_stat,
  my_stat,
  view_stat,
  add_featured_exercise_to_workout,
  get_similiar_workout_exercises,
  add_current_stat,
  remove_stat,
  delete_workout,
  save_log_stats,
  get_all_workout,
  confirm_trainer_request,
  edit_progression_plan,
  calendar,
  calendar_per_month,
  log_book,
  change_password,
  edit_account,
};
