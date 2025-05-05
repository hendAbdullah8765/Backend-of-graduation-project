const bcrypt = require('bcryptjs')
const slugify = require('slugify');
const { check , body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/UserModel')
const Orphanage =require('../../models/OrphanageModel')

exports.createUserValidator = [
  check('role').isIn(['Orphanage', 'Donor']).withMessage('Invalid role'), 
  check('name')
    .notEmpty().withMessage('User name is required')
    .isLength({ min: 2 }).withMessage('User name is too short')
    .custom((val,{req}) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('gender').optional()
          .notEmpty().withMessage('Gender is required')
          .isIn(['male', 'female']).withMessage('Gender must be male or female'), 
      
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
       if (user && req.body.role === 'Orphanage') { 
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


  check('adminName').if(body('role').equals('Orphanage'))
    .not().isEmpty().withMessage('Name is required for Orphanage role'),

  check('currentChildren').if(body('role').equals('Orphanage'))
    .isInt({ min: 0 }).withMessage('CurrentChildren must be a non-negative number'),

  check('totalCapacity').if(body('role').equals('Orphanage'))
    .isInt({ min: 1 }).withMessage('TotalCapacity must be at least 1'),

  check('staffCount').if(body('role').equals('Orphanage'))
    .isInt({ min: 0 }).withMessage('StaffCount must be a non-negative number'),

  check('establishedDate').if(body('role').equals('Orphanage'))
    .notEmpty().withMessage('EstablishedDate is required')
    .isISO8601().withMessage('Invalid date format'),
  check('birthdate').isDate().notEmpty()
    .withMessage('Birthdate is required'),
  check('workSchedule.workDays').optional().isArray().withMessage('workDays must be an array')
    .custom((val) => {
      const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const invalid = val.some(day => !validDays.includes(day));
      if (invalid) throw new Error('Invalid work day');
      return true;
    }),

  check('workSchedule.workHours').optional().isArray().withMessage('workHours must be an array')
    .custom((val) => {
      const validHours = ['Morning 6am-12pm', 'Afternoon 12pm-4pm', 'Evening 4pm-8pm', 'Night 8pm-12am'];
      const invalid = val.some(hr => !validHours.includes(hr));
      if (invalid) throw new Error('Invalid work hour');
      return true;
    }),  

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
  check('email')
  .notEmpty().withMessage('User email is required')
  .isEmail().withMessage("invalid email address")
  .custom((val) =>
     User.findOne({email: val}).then((user) => {
      if(user){
        return Promise.reject(new Error('E-mail already in user')); 
       }
  })
 ).optional(), 

 check('image').optional(), 

 check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
 .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),

   

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
  // name & slug
  body('name').optional().custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),

  // email
  check('email').optional()
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
       if (user && req.body.role === 'Orphanage') { 
         return Promise.reject(new Error('E-mail already in use for orphanage'));
       }
   })),
   check('gender').optional()
          .notEmpty().withMessage('Gender is required')
          .isIn(['male', 'female']).withMessage('Gender must be male or female'), 
      
  // phone
  check('phone').optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number. Only Egyptian and Saudi numbers are allowed.'),

  // image
  check('image').optional(),

  // adminName
  check('adminName').optional().isString().withMessage('adminName must be a string'),

  // currentChildren
  check('currentChildren').optional().isInt({ min: 0 }).withMessage('currentChildren must be a non-negative integer'),

  // totalCapacity
  check('totalCapacity').optional().isInt({ min: 0 }).withMessage('totalCapacity must be a non-negative integer'),

  // staffCount
  check('staffCount').optional().isInt({ min: 0 }).withMessage('staffCount must be a non-negative integer'),

  // workDays
  check('workDays').optional().isArray().withMessage('workDays must be an array')
    .custom((val) => {
      const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const invalid = val.some(day => !validDays.includes(day));
      if (invalid) throw new Error('Invalid work day');
      return true;
    }),

  // workHours
  check('workHours').optional().isArray().withMessage('workHours must be an array')
    .custom((val) => {
      const validHours = ['Morning 6am-12pm', 'Afternoon 12pm-4pm', 'Evening 4pm-8pm', 'Night 8pm-12am'];
      const invalid = val.some(hour => !validHours.includes(hour));
      if (invalid) throw new Error('Invalid work hour');
      return true;
    }),

  // establishedDate
  check('establishedDate').optional().isISO8601().toDate().withMessage('Invalid establishedDate'),

  // birthdate
  check('birthdate').optional().isISO8601().toDate().withMessage('Invalid birthdate'),

  validatorMiddleware,
];

