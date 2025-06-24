const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createDonationItemValidator = [
  body("userId").optional()
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId"),
  body("orphanageId")
    .notEmpty()
    .withMessage("orphanageId is required")
    .isMongoId()
    .withMessage("Invalid orphanageId"),
  body("itemType")
    .notEmpty()
    .withMessage("itemType is required")
    .isIn(["food", "clothes", "toys", "other"])
    .withMessage("Invalid itemType"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),
  body("status")
    .optional()
    .isIn(["pending", "delivered", "cancelled"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.getDonationItemValidator = [
  check("id").isMongoId().withMessage("Invalid donation item ID format"),
  validatorMiddleware,
];

exports.updateDonationItemValidator = [
  check("id").isMongoId().withMessage("Invalid donation item ID format"),
  body("itemType")
    .optional()
    .isIn(["food", "clothes", "toys", "other"])
    .withMessage("Invalid itemType"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),
  body("status")
    .optional()
    .isIn(["pending", "delivered", "cancelled"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.deleteDonationItemValidator = [
  check("id").isMongoId().withMessage("Invalid donation item ID format"),
  validatorMiddleware,
];
