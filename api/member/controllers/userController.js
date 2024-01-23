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

const validateMatchOtp = [
  check("otp").notEmpty().withMessage("Otp is required."),
];

const validateResetPassword = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("new_password").notEmpty().withMessage("New Password is required."),
];

const validateViewTrainerClientGroup = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("group_id").notEmpty().withMessage("Group ID is required."),
];

const validateRemoveClient = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("client_id").notEmpty().withMessage("Client ID is required."),
];

const validateRemoveTrainer = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("trainer_id").notEmpty().withMessage("Trainer ID is required."),
];

const validateExercises = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("exercise_type_id")
    .notEmpty()
    .withMessage("Exercise Type ID is required."),
  check("section_id").notEmpty().withMessage("Section ID is required."),
];

const validateDeleteCustomExercise = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("id").notEmpty().withMessage("Exercise ID is required."),
];

const validateMakePriorityToVideo = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("mobile_video").notEmpty().withMessage("Mobile Video is required."),
  check("exercise_id").notEmpty().withMessage("Exercise ID is required."),
  check("title").notEmpty().withMessage("Title is required."),
];

const validateFirstRun = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("progression_plan_id")
    .notEmpty()
    .withMessage("Progression Plan is required."),
  check("workoutdays").notEmpty().withMessage("Workout Days are required."),
  check("exp_level_id").notEmpty().withMessage("Experience Level is required."),
  check("available_equipment")
    .notEmpty()
    .withMessage("Available Equipment is required."),
];

const validateSaveLogbookStats = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("workout_date").notEmpty().withMessage("Workout date is required."),
  check("workout_id").notEmpty().withMessage("Workout ID is required."),
];

const validateRequestClient = [
  check("user_id").notEmpty().withMessage("User ID is required."),
  check("name").notEmpty().withMessage("Name is required."),
  check("email").notEmpty().withMessage("Email is required."),
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
    return "";
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
      workout_exercises.forEach(async (exercise) => {
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
          const additional_video = await get_trainer_additional_video(
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

const validate_otp = async (otp) => {
  const result = await db("users").where("forgot_password_otp", otp);
  return JSON.parse(JSON.stringify(result));
};

const get_trainers = async (member_email) => {
  const result = await db("users")
    .select(
      "trainer_clients.id",
      "users.email",
      "trainer_clients.status",
      "meta.first_name",
      "meta.last_name",
      "meta.photo",
      "meta.user_id"
    )
    .join("trainer_clients", "users.id", "trainer_clients.trainer_id")
    .join("meta", "users.id", "meta.user_id")
    .where("trainer_clients.email", member_email)
    .whereNot("trainer_clients.status", "denied");
  return JSON.parse(JSON.stringify(result));
};

const view_group = async (group_id) => {
  const group = await db("trainer_client_groups").where("id", group_id);
  if (group) {
    if (group.exp_level_id) {
      group.exp_level_name = await db("experience_level")
        .where("id", group.exp_level_id)
        .first();
    }
    if (group.available_equipment) {
      group.available_equipment_name = await db("equipment").whereIn(
        "id",
        group.available_equipment.split(",")
      );
    }
    group.members = await db("users")
      .select(
        "trainer_clients.id",
        "users.email",
        "trainer_clients.status",
        "meta.first_name",
        "meta.last_name",
        "meta.photo",
        "meta.user_id"
      )
      .join("trainer_clients", "users.id", "trainer_clients.client_id")
      .join("meta", "users.id", "meta.user_id")
      .where("trainer_clients.trainer_group_id", group_id);
    group.clients = group.members.map((member) => member.user_id).join(",");
  }
  return JSON.parse(JSON.stringify(group));
};

const delete_group = async (group_id) => {
  await db("trainer_client_groups")
    .where("trainer_group_id", group_id)
    .update("trainer_group_id", null);
  await db("trainer_client_groups").where("id", group_id).del();
  return true;
};

const removeClient = async (trainer_id, client_id) => {
  await db("trainer_clients")
    .where("trainer_id", trainer_id)
    .where("client_id", client_id)
    .del();
  const trainer_removed = await db("trainer_client_groups")
    .where("trainer_id", trainer_id)
    .first();
  if (trainer_removed) {
    const remove_clients = trainer_removed.removed_client_id.split(",");
    if (!remove_clients.includes(client_id)) {
      const newValue = [trainer_removed.removed_client_id, client_id].join(",");
      await db("trainer_removed_clients")
        .where("trainer_id", trainer_id)
        .update("removed_client_id", newValue);
    }
  } else {
    const newData = {
      trainer_id: trainer_id,
      removed_client_id: client_id,
    };
    await db("trainer_removed_clients").insert(newData);
  }
  return true;
};

const removeTrainer = async (client_id, trainer_id) => {
  await db("trainer_clients")
    .where("trainer_id", trainer_id)
    .where("client_id", client_id)
    .del();
  return true;
};

const get_groups_for_workout = async (trainer_id) => {
  const groups = await db("trainer_client_groups")
    .select(
      "CONCAT('group-',trainer_client_groups.id) as group_id",
      "trainer_client_groups.*"
    )
    .where("trainer_id", trainer_id);
  if (groups) {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].exp_level_id) {
        groups[i].exp_level_name = await db("experience_level")
          .where("id", groups[i].exp_level_id)
          .first();
      }
      if (groups[i].available_equipment) {
        groups[i].available_equipment_name = await db("equipment").whereIn(
          "id",
          groups[i].available_equipment.split(",")
        );
      }
      const members = await db("trainer_clients").where(
        "trainer_group_id",
        groups[i].id
      );
      groups[i].members_count = members.length;
    }
  }
  return JSON.parse(JSON.stringify(groups));
};

const get_skeleton_generator = async (option) => {
  const result = {
    hybrid_workout_sections: null,
    skeleton_section_types: null,
    exercise_types: null,
  };
  result.hybrid_workout_sections = await db("skeleton_section")
    .select([
      "skeleton_section_types.title",
      "skeleton_section_types.type",
      "skeleton_section.*",
    ])
    .join(
      "skeleton_section_types",
      "skeleton_section_types.id",
      "skeleton_section.section_type_id"
    )
    .where("skeleton_id", option.id);
  result.skeleton_section_types = await db("skeleton_section_types").select();
  result.exercise_types = await db("exercise_types")
    .orderBy("title", "asc")
    .select();
  return JSON.parse(JSON.stringify(result));
};

const get_exercises = async (options, page, limit) => {
  const result = await db("exercises")
    .select(["exercises.*", "exercise_types.title as type_title"])
    .join(
      "exercise_link_types",
      "exercise_link_types.exercise_id",
      "exercises.id"
    )
    .join("exercise_types", "exercise_types.id", "exercise_link_types.type_id")
    .where((qb) => {
      if (options.user_id) {
        qb.where("created_by", options.user_id);
      }
      if (options.available_equipment) {
        qb.whereRaw(
          "(id NOT IN(SELECT exercise_id FROM exercise_equipment GROUP BY exercise_id) OR id IN (SELECT exercise_id FROM exercise_equipment WHERE equipment_id IN (" +
            options.available_equipment +
            ")))"
        );
      }
      if (options.exercise_type) {
        qb.whereRaw(
          "id IN (SELECT exercise_id FROM exercise_link_types WHERE type_id = '" +
            options.exercise_type +
            "')"
        );
      }
      if (options.muscle) {
        qb.whereRaw(
          "id IN (SELECT exercise_id FROM exercise_muscles WHERE muscle_id = '" +
            options.muscle +
            "')"
        );
      }
      if (options.experience_level) {
        qb.orWhere("experience_id", options.experience_level);
      }
    })
    .orderBy("title", "asc")
    .limit(limit, (page - 1) * limit);
  return JSON.parse(JSON.stringify(result));
};

const exercisesByExerciseTypeId = async (exercise_type_id, trainer_id) => {
  const result = await db("exercises")
    .select("id", "title", "video", "mobile_video", "type")
    .whereRaw(
      "id in (SELECT exercise_id FROM exercise_link_types WHERE type_id = '" +
        exercise_type_id +
        "' ORDER BY title)"
    );
  if (result) {
    result.forEach(async (exercise, key) => {
      const additional_video = await get_trainer_additional_video(
        trainer_id,
        exercise.id
      );
      if (additional_video) {
        result[key].mobile_video = additional_video;
      }
      result[key].trainer_exercise = "";
    });
  }
  return JSON.parse(JSON.stringify(result));
};

const get_random_exercise = async (options) => {
  const result = await db("exercises")
    .select(["exercises.*", "exercise_types.title as type_title"])
    .join(
      "exercise_link_types",
      "exercise_link_types.exercise_id",
      "exercises.id"
    )
    .join("exercise_types", "exercise_types.id", "exercise_link_types.type_id")
    .where((qb) => {
      if (options.user_id) {
        qb.whereRaw(
          "id IN (SELECT exercise_id FROM user_available_exercises WHERE user_id = '" +
            options.user_id +
            "')"
        );
      }
      if (options.available_equipment) {
        qb.whereRaw(
          "(id NOT IN(SELECT exercise_id FROM exercise_equipment GROUP BY exercise_id) OR id IN (SELECT exercise_id FROM exercise_equipment WHERE equipment_id IN (" +
            options.available_equipment +
            ")))"
        );
      }
      if (options.exercise_type) {
        qb.whereRaw(
          "id IN (SELECT exercise_id FROM exercise_link_types WHERE type_id = '" +
            options.exercise_type +
            "')"
        );
      }
    })
    .orderBy("title", "asc")
    .limit(limit, (page - 1) * limit);
  return JSON.parse(JSON.stringify(result));
};

const get_upcoming_created_workouts = async (user_id) => {
  const upcomingWorkoutIds = await db("user_workouts")
    .select(["Max(user_workouts.id) as id"])
    .where("user_id", user_id)
    .where("completed", "false")
    .where("workout_created", "true")
    .where("workout_date", ">=", getFormattedDate())
    .orderBy("workout_date", "asc")
    .orderBy("id", "desc")
    .groupBy("user_workouts.workout_date");
  const workoutIdsArray = upcomingWorkoutIds.map((workout) => workout.id);
  let result = null;
  if (!workoutIdsArray) {
    result = await db("user_workouts")
      .select(
        "user_workouts.id",
        "user_workouts.title",
        "user_workouts.workout_date"
      )
      .whereIn("id", workoutIdsArray)
      .orderBy("workout_date", "asc");
  }
  if (result) {
    return JSON.parse(JSON.stringify(result));
  } else {
    return null;
  }
};

const get_all_clients = async (userId, page, limit) => {
  const trainer_removed = await db("trainer_removed_clients")
    .where("trainer_id", userId)
    .first();
  const result = await db("users")
    .select(
      "users.id as user_id",
      "users.username",
      "users.email",
      "IFNULL(trainer_clients.status, NULL) as status",
      "meta.first_name",
      "meta.last_name",
      "meta.phone_number",
      "meta.available_equipment",
      "meta.photo"
    )
    .join("trainer_clients", "users.id", "trainer_clients.client_id")
    .join("meta", "users.id", "meta.user_id")
    .where("users.group_id", 2)
    .where("trainer_clients.trainer_id", userId)
    .where((qb) => {
      if (trainer_removed) {
        qb.whereRaw("id NOT IN ('" + trainer_removed.removed_client_id + "')");
      }
    })
    .orderBy("users.created_on", "desc")
    .limit(limit, (page - 1) * limit);
  return JSON.parse(JSON.stringify(result));
};

const get_all_groups = async (userId, page, limit) => {
  const result = await db("trainer_client_groups")
    .where("trainer_id", userId)
    .limit(limit, (page - 1) * limit);
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

const assign_available_exercises = async (userId) => {
  const userDetail = await getUserDetail(userId);
  const available_exercise = await db("exercises").where(
    "experience_id",
    "<=",
    userDetail.exp_level_id
  );
  await db("user_available_exercises").where("user_id", userId).del();
  available_exercise.forEach(async (exercise) => {
    const insertData = {
      user_id: userId,
      exercise_id: exercise.id,
    };
    await db("user_available_exercises").insert(insertData);
  });
};

const get_exercise_counts = async (option) => {
  const userSession = await db("user_progressions")
    .where("user_id", option.user_id)
    .where("progression_id", option.progression_id)
    .first();
  let sessionDays = null;
  if (userSession) {
    sessionDays = await db("progression_sessions")
      .where("progression_id", option.progression_id)
      .where("day", "<=", userSession.session_count)
      .orderBy("day", "asc");
  } else {
    const insertData = {
      user_id: userId,
      progression_id: option.progression_id,
      session_count: 1,
    };
    await db("user_progressions").insert(insertData);
    sessionDays = await db("progression_sessions")
      .where("progression_id", option.progression_id)
      .where("day", "<=", 1)
      .orderBy("day", "asc");
  }

  const progression = await db("progressions")
    .where("id", option.progression_id)
    .first();
  const returnData = {
    sets: progression.default_sets,
    reps: progression.default_reps,
    time: progression.default_time,
    rest: progression.default_rest,
    weight: "",
    weight_option: "weighted",
  };
  return JSON.parse(JSON.stringify(returnData));
};

const create_next_workout = async (userId) => {
  const userDetail = await getUserDetail(userId);
  const prevWorkout = await db("user_workouts")
    .where("progression_plan_id", userDetail.progression_plan_id)
    .where("user_id", userId)
    .where("completed", "true")
    .whereRaw("workout_date <= CURDATE()")
    .orderBy("workout_date", "desc")
    .first();
  let nextWorkout = null;
  if (prevWorkout) {
    nextWorkout = await db("user_workouts")
      .where("progression_plan_id", userDetail.progression_plan_id)
      .where("user_id", userId)
      .where("completed", "false")
      .where("workout_date", ">=", prevWorkout.workout_date)
      .orderBy("workout_date", "asc")
      .first();
  } else {
    nextWorkout = await db("user_workouts")
      .where("progression_plan_id", userDetail.progression_plan_id)
      .where("user_id", userId)
      .where("completed", "false")
      .whereRaw("workout_date <= CURDATE()")
      .orderBy("workout_date", "asc")
      .first();
  }
  if (nextWorkout && nextWorkout.completed == "false") {
    const progression = await db("progression_plan_days")
      .select("progression.*")
      .join(
        "progressions",
        "progressions.id",
        "progression_plan_days.progression_id"
      )
      .where("day", userDetail.progression_plan_day)
      .where("plan_id", userDetail.progression_plan_id)
      .first();
    const updateData = {
      progression_id: progression.id,
    };
    await db("user_workouts").where("id", nextWorkout.id).update(updateData);
    const hybridWorkout = await db("skeleton_workouts")
      .select("skeleton_workouts.*")
      .join(
        "skeleton_focus",
        "skeleton_focus.skeleton_id",
        "skeleton_workouts.id"
      )
      .where("skeleton_focus.progression_id", progression.id)
      .orderBy("skeleton_workouts.id")
      .first();
    const hybridWorkoutSections = await db("skeleton_section")
      .select([
        "skeleton_section_types.title",
        "skeleton_section_types.type",
        "skeleton_section.*",
      ])
      .join(
        "skeleton_section_types",
        "skeleton_section_types.id",
        "skeleton_section.section_type_id"
      )
      .where("skeleton_id", hybridWorkout.id)
      .orderBy("display_order");
    let sectionCount = 1;
    await db("user_workout_sections").where("workout_id", nextWorkout.id);
    await db("user_workout_exercises").where("workout_id", nextWorkout.id);
    hybridWorkoutSections.forEach(async (section) => {
      const sectionData = {
        workout_id: nextWorkout.id,
        section_type_id: section.section_type_id,
        display_order: sectionCount++,
      };
      const insertId = await db("user_workout_sections").insert(sectionData, [
        "id",
      ]);
      const hybridWorkoutExerciseTypes = await db("skeleton_category")
        .select("exercise_types.title", "skeleton_category.*")
        .join(
          "exercise_types",
          "exercise_types.id",
          "skeleton_category.exercise_type_id"
        )
        .where("section_id", section.id)
        .orderBy("display_order");
      let exerciseCount = 1;
      hybridWorkoutExerciseTypes.forEach(async (category) => {
        const randomOption = {
          user_id: userId,
          available_equipment: userDetail.available_equipment,
          exercise_type: category.exercise_type_id,
        };
        const exercise = await get_random_exercise(randomOption);
        const exerciseData = {
          sets: "",
          reps: "",
          time: "",
          rest: "",
          weight: "",
          weight_option: "",
          workout_id: nextWorkout.id,
          exercise_id: "NULL",
          workout_section_id: insertId,
          exercise_type_id: category.exercise_type_id,
          display_order: exerciseCount++,
        };
        if (exercise) {
          const countOption = {
            user_id: userId,
            progression_id: progression.id,
            exercise_id: exercise.id,
            weight_type: exercise.weight_type,
            section_type: section.type,
          };
          const exerciseState = await get_exercise_counts(countOption);
          exerciseData.sets = exerciseState.sets;
          exerciseData.reps = exerciseState.reps;
          exerciseData.time = exerciseState.time;
          exerciseData.rest = exerciseState.rest;
          exerciseData.weight = exerciseState.weight;
          exerciseData.weight_option = exerciseState.weight_option;
          exerciseData.exercise_id = exercise.id;
        } else {
          const countOption = {
            user_id: userId,
            progression_id: progression.id,
            section_type: section.type,
          };
          const exerciseState = await get_exercise_counts(countOption);
          exerciseData.sets = exerciseState.sets;
          exerciseData.reps = exerciseState.reps;
          exerciseData.time = exerciseState.time;
          exerciseData.rest = exerciseState.rest;
          exerciseData.weight = exerciseState.weight;
          exerciseData.weight_option = exerciseState.weight_option;
        }
        await db("user_workout_exercises").insert(exerciseData);
      });
    });
    await db("user_workouts")
      .where("id", nextWorkout.id)
      .where("user_id", userId)
      .update({ workout_created: "true", title: hybridWorkout.title });
    return nextWorkout.id;
  } else {
    return false;
  }
};

const progression_change_workouts = async (userId) => {
  const existingWorkouts = await db("user_workouts")
    .whereRaw("workout_date >= CURDATE()")
    .whereRaw("progression_plan_id IS NOT NULL")
    .where("user_id", userId)
    .where("completed", "false");
  existingWorkouts.forEach(async (workout) => {
    await db("user_workout_exercises").where("workout_id", workout.id).del();
    await db("user_workout_sections").where("workout_id", workout.id).del();
    await db("user_workouts").where("id", workout.id).del();
  });
  const userDetail = await getUserDetail(userId);
  const weekdays = userDetail.workoutdays.split(",");

  weekdays.forEach(async (day) => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate.getDay() !== Number(day)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 90);

    while (currentDate < endDate) {
      const workoutDate = currentDate.toISOString().split("T")[0];
      const workoutValues = {
        user_id: user.user_id,
        workout_date: workoutDate,
        progression_plan_id: user.progression_plan_id,
      };
      await db("user_workouts").insert(workoutValues);

      currentDate.setDate(currentDate.getDate() + 7);
    }
  });
  await create_next_workout(userId);
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
    newUserData.ip_address = "0.0.0.0";
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
    await progression_change_workouts(userId);
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

        workout.uwe = btoa(JSON.stringify(uwe));
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
        remember_code: "",
      };
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
        first_name: bodyData.first_name
          ? bodyData.first_name
          : userDetail.first_name,
        last_name: bodyData.last_name
          ? bodyData.last_name
          : userDetail.last_name,
        city: bodyData.city ? bodyData.city : userDetail.city,
        state: bodyData.state ? bodyData.state : userDetail.state,
        zip: bodyData.zip ? bodyData.zip : userDetail.zip,
        phone_number: bodyData.phone_number
          ? bodyData.phone_number
          : userDetail.phone_number,
      };
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

const match_otp = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));

    const otp_user = await validate_otp(bodyData.otp);
    if (otp_user) {
      return res.json({
        status: 1,
        message: "OTP is valid.",
        data: otp_user.id,
      });
    } else {
      return res.json({
        status: 0,
        message: "Invalid OTP.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const reset_password = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const updateData = {
        password: await bcrypt.hash(bodyData.new_password, 10),
        forgot_password_otp: "",
      };
      await db("users").where("id", userId).update(updateData);
      return res.json({
        status: 1,
        message: "Password changed successfully.",
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

const trainers = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const result = {
        trainers: null,
      };
      result.trainers = await get_trainers(userDetail.email);
      if (result.trainers) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "There Are No Trainers.",
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

const view_trainer_client_group = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const group = await view_group(bodyData.group_id);
      if (group) {
        return res.json({
          status: 1,
          data: group,
        });
      } else {
        return res.json({
          status: 0,
          message: "No Such Group Exist.",
        });
      }
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

const remove_group = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail) {
      const group = await view_group(bodyData.group_id);
      if (group) {
        const res = await delete_group(bodyData.group_id);
        if (res) {
          const result = {};
          result.clients = await get_clients(userId);
          result.trainer_groups = await get_groups(userId);
          return res.json({
            status: 1,
            message: "Group deleted successfully.",
            data: result,
          });
        }
      } else {
        return res.json({
          status: 0,
          message: "No Such Group Exist.",
        });
      }
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

const remove_client = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const res = await removeClient(userId, bodyData.client_id);
      if (res) {
        const result = {};
        result.clients = await get_clients(userId);
        result.trainer_groups = await get_groups(userId);
        return res.json({
          status: 1,
          message: "Client removed successfully.",
          data: result,
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

const remove_trainer = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const res = await removeTrainer(userId, bodyData.trainer_id);
      if (res) {
        const result = {};
        result.clients = await get_clients(userId);
        result.trainer_groups = await get_groups(userId);
        return res.json({
          status: 1,
          message: "Trainer removed successfully.",
          data: result,
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

const workout_generator_array = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const result = {
        progression_id: [],
        skeleton_workout_id: [],
        available_equipment: [],
        client: {},
        workoutdays: [],
      };
      result.progression_id = await db("progressions").select();
      result.skeleton_workout_id = await db("skeleton_workouts").select();
      result.available_equipment = await db("equipment").select();
      result.client.clients = await get_clients(userId);
      result.client.groups = await get_groups_for_workout(userId);
      result.workoutdays = [
        {
          id: 1,
          value: "Monday",
        },
        {
          id: 2,
          value: "Tuesday",
        },
        {
          id: 3,
          value: "Wednesday",
        },
        {
          id: 4,
          value: "Thursday",
        },
        {
          id: 5,
          value: "Friday",
        },
        {
          id: 6,
          value: "Saturday",
        },
        {
          id: 7,
          value: "Sunday",
        },
      ];

      return res.json({
        status: 1,
        message: "List of array for workout.",
        data: result,
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

const skeleton_json = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const param = {
        skeleton_workout_id: bodyData.skeleton_workout_id
          ? bodyData.skeleton_workout_id
          : null,
        user_id: bodyData.client ? bodyData.client : userId,
        progression_id: "",
        available_equipment: null,
      };
      if (bodyData.progression_id) {
        const progression = await db("progression_plan_days")
          .select(["progressions.*"])
          .join(
            "progressions",
            "progressions.id",
            "progression_plan_days.progression_id"
          )
          .where("day", userDetail.progression_plan_day)
          .where("plan_id", userDetail.progression_plan_id)
          .first();
        const hybrid_workout = await db("skeleton_workouts")
          .select(["skeleton_workouts.*"])
          .join(
            "skeleton_focus",
            "skeleton_focus.skeleton_id",
            "skeleton_workouts.id"
          )
          .where("skeleton_focus.progression_id", progression.id)
          .first();
        param.progression_id = progression.id;
        param.skeleton_workout_id = hybrid_workout.id;
      }
      const postAvailableEquipment = bodyData.available_equipment;

      if (postAvailableEquipment !== "" && postAvailableEquipment !== "none") {
        param.available_equipment = postAvailableEquipment.split(",");
      } else if (postAvailableEquipment === "none") {
        param.available_equipment = postAvailableEquipment;
      } else {
        param.available_equipment = "";
      }
      const result = await get_skeleton_generator(param);
      return res.json({
        status: 1,
        message: "List of array for workout.",
        data: result,
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

const skeleton_section_types_array = async (req, res) => {
  try {
    const result = await db("skeleton_section_types").select();
    if (result) {
      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "No section found.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const exercise_types_array = async (req, res) => {
  try {
    const result = await db("exercise_types").orderBy("title", "asc").select();
    if (result) {
      return res.json({
        status: 1,
        data: result,
      });
    } else {
      return res.json({
        status: 0,
        message: "No exercise found.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const get_all_exercises = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const page = bodyData.page ? bodyData.page : 1;
      const limit = bodyData.limit ? bodyData.limit : 1000000;
      const option = {
        user_id: userId,
      };
      const result = await get_exercises(option, page, limit);
      if (result) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No exercise found.",
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

const exercises = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const result = await exercisesByExerciseTypeId(
        bodyData.exercise_type_id,
        userId
      );
      if (result) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No exercise found.",
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

const featured_exercise = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const option = {
        user_id: userId,
      };
      const result = {
        featured_exercise: null,
        upcoming_workouts: null,
      };
      result.featured_exercise = await get_random_exercise(option);
      result.upcoming_workouts = await get_upcoming_created_workouts(userId);
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

const delete_custom_exercise = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      await db("exercises").where("id", bodyData.id).del();
      const exercise_type_id = await db("exercise_link_types")
        .select("type_id")
        .where("exercise_id", bodyData.id)
        .first();
      await db("exercise_types").where("id", exercise_type_id.type_id).del();
      await db("exercise_link_types").where("exercise_id", bodyData.id).del();
      return res.json({
        status: 1,
        message: "Exercise deleted successfully.",
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

const prebuild_videos_list = async (req, res) => {
  try {
    const result = await db("exercises")
      .select("id", "title", "mobile_video")
      .limit(4);

    return res.json({
      status: 1,
      data: result,
    });
  } catch (e) {
    console.log(e);
  }
};

const list_of_videos = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const exercise_videos = await db("exercises").select(
        "id as exercise_id",
        "title",
        "mobile_video"
      );
      const additional_exercise_videos = await db(
        "additional_exercise_videos"
      ).select("exercise_id", "title", "mobile_video");
      const result = [...exercise_videos, ...additional_exercise_videos];
      return res.json({
        status: 1,
        data: result,
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

const make_priority_to_video = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const checkExerciseTable = await db("exercises")
        .select("id as exercise_id", "title", "mobile_video")
        .where("mobile_video", bodyData.mobile_video)
        .where("id", bodyData.exercise_id);
      await db("additional_exercise_videos")
        .where("exercise_id", bodyData.exercise_id)
        .where("trainer_id", userId)
        .update({ priority: 0 });
      if (!checkExerciseTable) {
        const checkAdditionalExerciseTable = await db(
          "additional_exercise_videos"
        )
          .where("mobile_video", bodyData.mobile_video)
          .where("trainer_id", userId)
          .where("exercise_id", bodyData.exercise_id)
          .first();
        if (checkAdditionalExerciseTable) {
          await db("additional_exercise_videos")
            .where("id", checkAdditionalExerciseTable.id)
            .update({ priority: 1 });
        } else {
          const insertData = {
            title: bodyData.title,
            mobile_video: bodyData.mobile_video,
            trainer_id: userId,
            exercise_id: bodyData.exercise_id,
            priority: 1,
          };
          await db("additional_exercise_videos").insert(insertData);
        }
      }
      return res.json({
        status: 1,
        message: "Video added for this exercise successfully.",
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

const all_clients = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 3) {
      const page = bodyData.page ? bodyData.page : 1;
      const limit = bodyData.limit ? bodyData.limit : 10;
      const result = await get_all_clients(userId, page, limit);
      if (result) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No clients found",
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

const trainer_groups = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;

    const userDetail = await getUserDetail(userId);
    if (userDetail && userDetail.group_id == 2) {
      const page = bodyData.page ? bodyData.page : 1;
      const limit = bodyData.limit ? bodyData.limit : 10;
      const result = await get_all_groups(userId, page, limit);
      if (result) {
        return res.json({
          status: 1,
          data: result,
        });
      } else {
        return res.json({
          status: 0,
          message: "No clients found",
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

const first_run = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    if (bodyData.progression_plan_id) {
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
      const updateData = {
        progression_plan_id: bodyData.progression_plan_id,
        workoutdays: bodyData.workoutdays,
        exp_level_id: bodyData.exp_level_id,
        available_equipment: bodyData.available_equipment,
      };
      await db("meta").where("user_id", userDetail.id).update(updateData);
      await assign_available_exercises(userId);
      await progression_change_workouts(userId);
    }
  } catch (e) {
    console.log(e);
  }
};

const save_logbook_stats = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userWorkout = await db("user_workouts")
      .where("id", bodyData.workout_id)
      .where("user_id", userId)
      .first();
    if (userWorkout) {
      const userWorkoutExercises = JSON.parse(atob(bodyData.uwe));
      userWorkoutExercises.forEach(async (uwe) => {
        await db("user_workout_stats")
          .where("user_id", userId)
          .where("uw_id", bodyData.workout_id)
          .where("uwe_id", uwe.id)
          .del();
        const uweRow = await db("user_workout_exercises")
          .where("workout_id", bodyData.workout_id)
          .where("id", uwe.uwe_id)
          .first();
        if (uweRow) {
          uwe.sets.forEach(async (set, key) => {
            const insertData = {
              uw_id: bodyData.workout_id,
              uwe_id: uwe.uwe_id,
              workout_date: bodyData.workout_date,
              user_id: userId,
              progression_id: uweRow.progression_id,
              exercise_id: uweRow.exercise_id,
              difficulty: uwe.difficulty,
              set: set,
            };
            insertData.reps = uwe.reps[key] ? uwe.reps[key] : "NULL";
            insertData.time = uwe.time[key] ? uwe.time[key] : "NULL";
            insertData.weight = uwe.weight[key] ? uwe.weight[key] : "NULL";
            await db("user_workout_stats").insert(insertData);
          });
        }
      });
      if (userWorkout.completed != "true" && userWorkout.progression_id != "") {
        const currentProgression = await db("user_progressions")
          .where("progression_id", userWorkout.progression_id)
          .where("user_id", userid)
          .first();
        if (currentProgression) {
          await db("user_progressions")
            .where("progression_id", userWorkout.progression_id)
            .where("user_id", userId)
            .update({ session_count: currentProgression.session_count + 1 });
        } else {
          const insertData = {
            progression_id: userWorkout.progression_id,
            user_id: userId,
            session_count: 1,
          };
          await db("user_progressions").insert(insertData);
        }
      }
      await db("user_workouts")
        .where("id", bodyData.workout_id)
        .where("user_id", userId)
        .update({
          completed: "true",
        });
      if (userWorkout.progression_id != "") {
        await create_next_workout(userId);
      }
      return res.json({
        status: 1,
        message:
          "Your workout stats have been saved and your next workout has been generated based on these stats.",
      });
    } else {
      return res.json({
        status: 0,
        message: "Your workout stats failed to save.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const request_client = async (req, res) => {
  await validateHandle(req, res);

  try {
    const bodyData = JSON.parse(JSON.stringify(req.body));
    const userId = bodyData.user_id;
    const userDetail = await getUserDetail(userId);

    if (userDetail && userDetail.group_id == 3) {
      const currentClients = await db("trainer_clients")
        .where("email", bodyData.email)
        .where("trainer_id", userId)
        .first();
      if (currentClients) {
        if (currentClients.status == "denied") {
          await db("trainer_clients").where("id", currentClients.id).update({
            status: "requested",
          });
        } else {
          return res.json({
            status: 0,
            message: "You have already requested to train this client.",
          });
        }
      } else {
        const insertData = {
          name: bodyData.name,
          trainer_id: userId,
          email: bodyData.email,
          email_message: bodyData.email_message,
        };
        await db("trainer_client").insert(insertData);
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
  validateMatchOtp,
  validateResetPassword,
  validateViewTrainerClientGroup,
  validateRemoveClient,
  validateRemoveTrainer,
  validateExercises,
  validateDeleteCustomExercise,
  validateMakePriorityToVideo,
  validateFirstRun,
  validateSaveLogbookStats,
  validateRequestClient,
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
  match_otp,
  reset_password,
  trainers,
  view_trainer_client_group,
  remove_group,
  remove_client,
  remove_trainer,
  workout_generator_array,
  skeleton_json,
  skeleton_section_types_array,
  exercise_types_array,
  get_all_exercises,
  exercises,
  featured_exercise,
  delete_custom_exercise,
  prebuild_videos_list,
  list_of_videos,
  make_priority_to_video,
  all_clients,
  trainer_groups,
  first_run,
  save_logbook_stats,
  request_client,
};
