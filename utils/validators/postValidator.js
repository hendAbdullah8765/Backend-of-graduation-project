const slugify = require('slugify');
const { check , body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getPostValidator = [
    check('id').isMongoId().withMessage('Invalid post id format'),
    validatorMiddleware,
];

exports.createPostValidator = [
    check('content')
    .notEmpty()
    .withMessage('content post required')
    .isLength({min: 1})
    .withMessage("Too Short Post content"),
    body('content').custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }), 

    check('image').optional(), 
  
    check('images').optional(), 

    validatorMiddleware,
] 

exports.updatePostValidator = [
    check('id').isMongoId().withMessage('Invalid post id format'),
    body('content').custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,
]

exports.deletePostValidator = [
    check('id').isMongoId().withMessage('Invalid post id format'),
    validatorMiddleware,
]