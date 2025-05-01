const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createNotificationValidator = [
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId"),
  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isIn(["comment", "follow", "donation", "adoption_request"])
    .withMessage("Invalid notification type"),
  body("relatedId")
    .notEmpty()
    .withMessage("relatedId is required")
    .isMongoId()
    .withMessage("Invalid relatedId"),
  body("isRead").optional().isBoolean().withMessage("isRead must be boolean"),
  validatorMiddleware,
];

exports.getNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];

exports.updateNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  body("isRead").optional().isBoolean().withMessage("isRead must be boolean"),
  validatorMiddleware,
];

exports.deleteNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];
