const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createAdoptionRequestValidator = [
  // body("userId")
  //   .notEmpty()
  //   .withMessage("userId is required")
  //   .isMongoId()
  //   .withMessage("Invalid userId"),
  body("childId")
    .notEmpty()
    .withMessage("childId is required")
    .isMongoId()
    .withMessage("Invalid childId"),
  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.getAdoptionRequestValidator = [
  check("id").isMongoId().withMessage("Invalid adoption request ID format"),
  validatorMiddleware,
];

exports.updateAdoptionRequestValidator = [
  check("id").isMongoId().withMessage("Invalid adoption request ID format"),
  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.deleteAdoptionRequestValidator = [
  check("id").isMongoId().withMessage("Invalid adoption request ID format"),
  validatorMiddleware,
];
