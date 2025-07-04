const slugify = require('slugify');
const { check , body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createChildValidator = [
  check('name')
    .notEmpty().withMessage('Child name is required')
    .isLength({ min: 2 }).withMessage('Child name is too short'),

  check('birthdate').optional()

    .notEmpty().withMessage('Child birthdate is required'),

  check('gender')
    .notEmpty().withMessage('Gender is required')
    .withMessage('Gender must be male or female'),

  check('skinTone')
    .notEmpty().withMessage('Skin color is required')
    .isString(),

  check('hairColor')
    .optional()
   .notEmpty().withMessage('Invalid hair color'),

  check('hairStyle')
    .optional()
    .notEmpty().withMessage('Invalid hair style'),

  check('religion')
    .optional()
    .notEmpty().withMessage('Invalid religion'),
  
  check('image')
    .optional()
    .isURL().withMessage('Photo must be a valid URL'),
  
  // check('orphanage')
  //   .notEmpty().withMessage('Orphanage ID is required')
  //   .isMongoId().withMessage('Invalid orphanage ID format')
  //   .custom((orphanageId) =>
  //      Orphanage.findById(orphanageId).then((orphanage) => {
  //       if (!orphanage){
  //         return Promise
  //         .reject
  //         (new Error (`No Orphanage for this id: ${orphanageId}`))
  //       }
  //     })
  //   ) .custom((val, { req }) => {
  //           req.body.slug = slugify(val);
  //           return true;
  //         }),

  validatorMiddleware
];

exports.getChildValidator = [
  check('id')
    .isMongoId().withMessage('Invalid child ID format'),
  validatorMiddleware
];

exports.updateChildValidator = [
  check('id')
    .isMongoId().withMessage('Invalid child ID format'),
         body('name').custom((val, { req }) => {
                req.body.slug = slugify(val);
                return true;
              }),
    validatorMiddleware
];

exports.deleteChildValidator = [
  check('id')
    .isMongoId().withMessage('Invalid child ID format'),
  validatorMiddleware
];
