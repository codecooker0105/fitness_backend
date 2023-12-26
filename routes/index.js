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
router.post(
  "/add_stat",
  multer().none(),
  validateAddStat,
  userController.add_stat
);
router.post(
  "/my_stat",
  multer().none(),
  validateMyStat,
  userController.my_stat
);
router.post(
  "/view_stat",
  multer().none(),
  validateViewStat,
  userController.view_stat
);
router.post(
  "/add_featured_exercise_to_workout",
  multer().none(),
  validateAddFeaturedExerciseToWorkout,
  userController.add_featured_exercise_to_workout
);
router.post(
  "/get_similiar_workout_exercises",
  multer().none(),
  validateGetSimiliarWorkoutExercise,
  userController.get_similiar_workout_exercises
);
router.post(
  "/add_current_stat",
  multer().none(),
  validateAddCurrentStat,
  userController.add_current_stat
);
router.post(
  "/remove_stat",
  multer().none(),
  validateRemoveStat,
  userController.remove_stat
);
router.post(
  "/delete_workout",
  multer().none(),
  validateDeleteWorkout,
  userController.delete_workout
);
router.post(
  "/save_log_stats",
  multer().none(),
  userController.save_log_stats
);
router.post(
  "/get_all_workout",
  multer().none(),
  validateClients,
  userController.get_all_workout
);
router.post(
  "/confirm_trainer_request",
  multer().none(),
  validateConfirmTrainerRequest,
  userController.confirm_trainer_request
);
router.post(
  "/edit_progression_plan",
  multer().none(),
  validateEditProgressionPlan,
  userController.edit_progression_plan
);
router.post(
  "/calendar",
  multer().none(),
  validateClients,
  userController.calendar
);
router.post(
  "/calendar_per_month",
  multer().none(),
  validateClients,
  userController.calendar_per_month
);
router.post(
  "/log_book",
  multer().none(),
  validateClients,
  userController.log_book
);
router.post(
  "/change_password",
  multer().none(),
  validateChangePassword,
  userController.change_password
);
router.post(
  "/edit_account",
  multer().none(),
  validateClients,
  userController.edit_account
);
router.post(
  "/match_otp",
  multer().none(),
  validateMatchOtp,
  userController.match_otp
);
router.post(
  "/reset_password",
  multer().none(),
  validateResetPassword,
  userController.reset_password
);
router.post(
  "/trainers",
  multer().none(),
  validateClients,
  userController.trainers
);
router.post(
  "/view_trainer_client_group",
  multer().none(),
  validateViewTrainerClientGroup,
  userController.view_trainer_client_group
);
router.post(
  "/remove_group",
  multer().none(),
  validateViewTrainerClientGroup,
  userController.remove_group
);
router.post(
  "/remove_client",
  multer().none(),
  validateRemoveClient,
  userController.remove_client
);
router.post(
  "/remove_trainer",
  multer().none(),
  validateRemoveTrainer,
  userController.remove_trainer
);
router.post(
  "/workout_generator_array",
  multer().none(),
  validateClients,
  userController.workout_generator_array
);
router.post(
  "/skeleton_json",
  multer().none(),
  validateClients,
  userController.skeleton_json
);
router.post(
  "/skeleton_section_types_array",
  multer().none(),
  userController.skeleton_section_types_array
);
router.post(
  "/exercise_types_array",
  multer().none(),
  userController.exercise_types_array
);
router.post(
  "/get_all_exercises",
  multer().none(),
  validateClients,
  userController.get_all_exercises
);
router.post(
  "/exercises",
  multer().none(),
  validateExercises,
  userController.exercises
);
router.post(
  "/featured_exercise",
  multer().none(),
  validateClients,
  userController.featured_exercise
);
router.post(
  "/delete_custom_exercise",
  multer().none(),
  validateDeleteCustomExercise,
  userController.delete_custom_exercise
);
router.post(
  "/prebuild_videos_list",
  multer().none(),
  userController.prebuild_videos_list
);
router.post(
  "/list_of_videos",
  multer().none(),
  validateClients,
  userController.list_of_videos
);
router.post(
  "/make_priority_to_video",
  multer().none(),
  validateMakePriorityToVideo,
  userController.make_priority_to_video
);
router.post(
  "/all_clients",
  multer().none(),
  validateClients,
  userController.all_clients
);
router.post(
  "/trainer_groups",
  multer().none(),
  validateClients,
  userController.trainer_groups
);
router.post(
  "/first_run",
  multer().none(),
  validateFirstRun,
  userController.first_run
);
router.post(
  "/save_logbook_stats",
  multer().none(),
  validateSaveLogbookStats,
  userController.save_logbook_stats
);
module.exports = router;
