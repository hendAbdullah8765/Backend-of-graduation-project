const slugify = require('slugify');
const { check , body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Orphanage =require('../../models/OrphanageModel')

exports.createChildValidator = [
  check('name')
    .notEmpty().withMessage('Child name is required')
    .isLength({ min: 2 }).withMessage('Child name is too short'),

  check('age')
    .notEmpty().withMessage('Child age is required')
    .isInt({ min: 0 }).withMessage('Age must be a positive number'),

  check('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),

  check('EducationalLevel')
    .notEmpty().withMessage('Educational level is required'),

  check('skinColor')
    .notEmpty().withMessage('Skin color is required')
    .isString(),

  check('hairColor')
    .optional()
    .isIn(['black', 'brown', 'blonde', 'red', 'gray']).withMessage('Invalid hair color'),

  check('hairStyle')
    .optional()
    .isIn(['curly', 'wavy', 'straight']).withMessage('Invalid hair style'),

  check('religion')
    .optional()
    .isIn(['Muslim', 'Christian']).withMessage('Invalid religion'),
  
  check('photo')
    .optional()
    .isURL().withMessage('Photo must be a valid URL'),
  
  check('orphanage')
    .notEmpty().withMessage('Orphanage ID is required')
    .isMongoId().withMessage('Invalid orphanage ID format')
    .custom((orphanageId) =>
       Orphanage.findById(orphanageId).then((orphanage) => {
        if (!orphanage){
          return Promise
          .reject
          (new Error (`No Orphanage for this id: ${orphanageId}`))
        }
      })
    ) .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
          }),

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
