const slugify = require('slugify');
const { check  } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Orphanage = require('../../models/OrphanageModel')
const User = require('../../models/UserModel')

exports.signupValidator = [
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
  
  check('profileImg').optional(), 

  check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
  .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),
 
  check('role').optional().isIn(['Orphanage', 'Donor']).withMessage('Invalid role'), 
  
  check('address')
    .notEmpty().withMessage('User address is required'),
  validatorMiddleware
];
exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Orphanage email is required')
    .isEmail()
    .withMessage("invalid email address"),

  check('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({min:6})
    .withMessage('password must be at least 6 characters'),


  validatorMiddleware
];