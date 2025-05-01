const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getFollowValidator = [
    check('id').isMongoId().withMessage('Invalid Follow id format'),
    validatorMiddleware,
];

exports.createFollowValidator = [
    check('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid User ID format'),

  check('pageId')
    .notEmpty().withMessage('Page ID is required')
    .isMongoId().withMessage('Invalid Page ID format'),

    validatorMiddleware,
] 

exports.deleteFollowValidator = [
    check('id').isMongoId().withMessage('Invalid Follow id format'),
    validatorMiddleware,
]