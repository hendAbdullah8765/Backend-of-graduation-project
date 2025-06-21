const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createChatValidator = [
  check('firstId')
    .notEmpty()
    .withMessage('firstId is required')
    .isMongoId()
    .withMessage('Invalid firstId format'),

  check('secondId')
    .notEmpty()
    .withMessage('secondId is required')
    .isMongoId()
    .withMessage('Invalid secondId format'),

  validatorMiddleware,
];
