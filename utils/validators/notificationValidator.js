const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");






exports.deleteNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];
