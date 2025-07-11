const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createDonationValidator = [

  body("orphanageId")
    .notEmpty()
    .withMessage("orphanageId is required")
    .isMongoId()
    .withMessage("Invalid orphanageId"),
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isFloat({ gt: 0 })
    .withMessage("amount must be a number > 0"),
  body("paymentMethod")
    .notEmpty()
    .withMessage("paymentMethod is required")
    .withMessage("Invalid paymentMethod"),
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.getDonationValidator = [
  check("id").isMongoId().withMessage("Invalid donation ID format"),
  validatorMiddleware,
];

exports.updateDonationValidator = [
  check("id").isMongoId().withMessage("Invalid donation ID format"),
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("amount must be a number > 0"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "paypal"])
    .withMessage("Invalid paymentMethod"),
  body("status")
    .optional()
    .isIn(["pending", "completed", "failed"])
    .withMessage("Invalid status"),
  validatorMiddleware,
];

exports.deleteDonationValidator = [
  check("id").isMongoId().withMessage("Invalid donation ID format"),
  validatorMiddleware,
];
