const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Settings = require("../../models/SettingsModel");

function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

exports.createSettingsValidator = [
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId")
    .custom((val) =>
      Settings.findOne({ userId: val }).then((doc) => {
        if (doc)
          return Promise.reject(
            new Error("Settings already exist for this user")
          );
      })
    ),
  body("preferences")
    .optional()
    .custom(isPlainObject)
    .withMessage("preferences must be an object"),
  body("notificationSettings")
    .optional()
    .custom(isPlainObject)
    .withMessage("notificationSettings must be an object"),
  validatorMiddleware,
];

exports.getSettingsValidator = [
  check("id").isMongoId().withMessage("Invalid settings ID format"),
  validatorMiddleware,
];

exports.updateSettingsValidator = [
  check("id").isMongoId().withMessage("Invalid settings ID format"),
  body("preferences")
    .optional()
    .custom(isPlainObject)
    .withMessage("preferences must be an object"),
  body("notificationSettings")
    .optional()
    .custom(isPlainObject)
    .withMessage("notificationSettings must be an object"),
  validatorMiddleware,
];

exports.deleteSettingsValidator = [
  check("id").isMongoId().withMessage("Invalid settings ID format"),
  validatorMiddleware,
];
