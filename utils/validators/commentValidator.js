const slugify = require('slugify');
const { check , body} = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const Post = require('../../models/PostModel')

exports.getCommentValidator = [
    check('id').isMongoId().withMessage('Invalid Comment id format'),
    validatorMiddleware,
];

exports.createCommentValidator = [
    check('content')
    .notEmpty()
    .withMessage('content Comment required')
    .isLength({min: 3})
    .withMessage("Too Short Comment content"),
    check('post').notEmpty()
    .withMessage('This post not exist')
    .isMongoId().withMessage('Invalid post ID formate')
    .custom((postId) =>
        Post.findById(postId).then((post) => {
         if (!post){
           return Promise
           .reject
           (new Error (`No Post for this id: ${postId}`))
         }
       })
     )
    .custom((val, { req }) => {
             req.body.slug = slugify(val);
             return true;
           }), 
    validatorMiddleware,
] 
 
exports.updateCommentValidator = [
    check('id').isMongoId().withMessage('Invalid Comment id format'),
     body('content').custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
          }),
    validatorMiddleware,
]

exports.deleteCommentValidator = [
    check('id').isMongoId().withMessage('Invalid Comment id format'),
    validatorMiddleware,
]