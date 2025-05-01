const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const Post =require('../../models/PostModel')

exports.getReactionValidator = [
    check('post').isMongoId().withMessage('Invalid post id format'),
    validatorMiddleware,
];

exports.createReactionValidator = [
    check('type')
    .notEmpty()
    .withMessage('type Reaction required'),
    check('post').notEmpty()
    .withMessage('This post not exist').isMongoId()
    .withMessage('Invalid post ID formate')
    .custom((postId) =>
           Post.findById(postId).then((post) => {
            if (!post){
              return Promise
              .reject
              (new Error (`No Post for this id: ${postId}`))
            }
          })
        ),
    
    validatorMiddleware,
] 

exports.updateReactionValidator = [
    check('id').isMongoId()
    .withMessage('Invalid Reaction id format'),
    validatorMiddleware,
]

exports.deleteReactionValidator = [
    check('id').isMongoId()
    .withMessage('Invalid Reaction id format'),
    validatorMiddleware,
]