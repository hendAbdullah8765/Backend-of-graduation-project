const bcrypt = require('bcryptjs')
const slugify = require('slugify');
const { check , body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/UserModel')
const Orphanage =require('../../models/OrphanageModel')

exports.createUserValidator = [
  check('name')
    .notEmpty().withMessage('User name is required')
    .isLength({ min: 2 }).withMessage('User name is too short')
    .custom((val,{req}) => {
        req.body.slug = slugify(val);
        return true;
    }),

  check('email')
    .notEmpty().withMessage('User email is required')
    .isEmail().withMessage("invalid email address")
    .custom((val) =>
       User.findOne({email: val}).then((user) => {
        if(user){
          return Promise.reject(new Error('E-mail already in user')); 
         }
    })) 
    .custom((val,{req}) =>
      Orphanage.findOne({ email: val }).then((user) => {
       if (user && req.body.role === 'Orphanage') { // لو الدور هو "دار أيتام"
         return Promise.reject(new Error('E-mail already in use for orphanage'));
       }
   })),
  check('password')
    .notEmpty().withMessage('password is required')
    .isLength({min:6}).withMessage('password must be at least 6 characters')
    .custom((password,{req}) => {
        if(password !== req.body .passwordConfirm){
          throw new Error('password confirmation incorrect')  
        }
        return true;
    }),
 
    check('passwordConfirm')
  .notEmpty().withMessage('password confirm required'),
  
  check('image').optional(), 

  check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
  .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),
 
  check('role').optional().isIn(['Orphanage', 'Donor']).withMessage('Invalid role'), 
    

  validatorMiddleware
];

exports.getUserValidator = [
  check('id')
    .isMongoId().withMessage('Invalid User ID format'),
  validatorMiddleware
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User ID format'),
  body('name').optional()
  .custom((val, { req }) => {
     req.body.slug = slugify(val);
      return true;
  }),
  check('email').optional()
  .notEmpty().withMessage('User email is required')
  .isEmail().withMessage("invalid email address")
  .custom((val) =>
     User.findOne({email: val}).then((user) => {
      if(user){
        return Promise.reject(new Error('E-mail already in user')); 
       }
  })
 ),  
 check('image').optional(), 

 check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
 .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),

 check('role').optional(), 
   

    validatorMiddleware
];

exports.changeUserPasswordValidator =[
  check('id').isMongoId().withMessage('Invalid User ID format'),
   body('currentPassword')
   .notEmpty()
   .withMessage('You must enter your current password'),
   body('passwordConfirm')
   .notEmpty()
   .withMessage('you must enter the password confirm'),
   body('password')
   .notEmpty()
   .withMessage('you must enter new password ')
   .custom(async (val, {req}) => {
    //1- varify current password
    const user = await User.findById(req.params.id);
    if(!user){
      throw new Error('There is no user for this id')
    }
  const isCorrectPassword = await  bcrypt.compare
  (req.body.currentPassword ,
     user.password
    );
   if(!isCorrectPassword) {
    throw new Error('Incorrect current password')
   } 
    //2-  varify password confirm
    if(val !== req.body .passwordConfirm){
      throw new Error('password confirmation incorrect')  
    }
    return true;
   }),
   validatorMiddleware
  ];

exports.deleteUserValidator = [
  check('id')
    .isMongoId().withMessage('Invalid User ID format'),
  validatorMiddleware
];

exports.updateLoggedUserValidator = [
  body('name').optional()
  .custom((val, { req }) => {
     req.body.slug = slugify(val);
      return true;
  }),
  check('email').optional()
  .notEmpty().withMessage('User email is required')
  .isEmail().withMessage("invalid email address")
  .custom((val) =>
     User.findOne({email: val}).then((user) => {
      if(user){
        return Promise.reject(new Error('E-mail already in user')); 
       }
  })
 ),  
 check('image').optional(), 

 check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
 .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),

 validatorMiddleware
];
