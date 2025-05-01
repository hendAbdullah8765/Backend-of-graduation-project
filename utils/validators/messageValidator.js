const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createMessageValidator = [
  body("senderId")
    .notEmpty()
    .withMessage("senderId is required")
    .isMongoId()
    .withMessage("Invalid senderId"),
  body("receiverId")
    .notEmpty()
    .withMessage("receiverId is required")
    .isMongoId()
    .withMessage("Invalid receiverId"),
  body("message")
    .notEmpty()
    .withMessage("message text is required")
    .isString()
    .withMessage("message must be a string"),
  validatorMiddleware,
];

exports.getMessageValidator = [
  check("id").isMongoId().withMessage("Invalid message ID format"),
  validatorMiddleware,
];

exports.updateMessageValidator = [
  check("id").isMongoId().withMessage("Invalid message ID format"),
  body("message").optional().isString().withMessage("message must be a string"),
  validatorMiddleware,
];

exports.deleteMessageValidator = [
  check("id").isMongoId().withMessage("Invalid message ID format"),
  validatorMiddleware,
];
