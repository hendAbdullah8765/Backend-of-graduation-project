// const bcrypt = require('bcryptjs')
// const slugify = require('slugify');
// const { check , body } = require('express-validator');
// const validatorMiddleware = require('../../middlewares/validatorMiddleware');
// const Orphanage = require('../../models/OrphanageModel')

// exports.createOrphanageValidator = [
//   check('name')
//     .notEmpty().withMessage('Orphanage name is required')
//     .isLength({ min: 3 }).withMessage('Orphanage name is too short')
//     .custom((val,{req}) => {
//         req.body.slug = slugify(val);
//         return true;
//     }),

//   check('email')
//     .notEmpty().withMessage('Orphanage email is required')
//     .isEmail().withMessage("invalid email address")
//     .custom((val) =>
//        Orphanage.findOne({email: val}).then((orphanage) => {
//         if(orphanage){
//           return Promise.reject(new Error('E-mail already exist')); 
//          }
//     })),

//   check('password')
//     .notEmpty().withMessage('password is required')
//     .isLength({min:6}).withMessage('password must be at least 6 characters')
//     .custom((password,{req}) => {
//         if(password !== req.body .passwordConfirm){
//           throw new Error('password confirmation incorrect')  
//         }
//         return true;
//     }),
 
//     check('passwordConfirm')
//   .notEmpty().withMessage('password confirm required'),
  
//   check('profileImg').optional(), 

//   check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
//   .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),
 
//   check('role').optional(), 
    

//   validatorMiddleware
// ];

// exports.getOrphanageValidator = [
//   check('id')
//     .isMongoId().withMessage('Invalid Orphanage ID format'),
//   validatorMiddleware
// ];

// exports.updateOrphanageValidator = [
//   check('id').isMongoId().withMessage('Invalid Orphanage ID format'),
//   body('name').optional()
//   .custom((val, { req }) => {
//      req.body.slug = slugify(val);
//       return true;
//   }),
//   check('email')
//   .notEmpty().withMessage('Orphanage email is required')
//   .isEmail().withMessage("invalid email address")
//   .custom((val) =>
//      Orphanage.findOne({email: val}).then((orphanage) => {
//       if(orphanage){
//         return Promise.reject(new Error('E-mail already in Orphanage')); 
//        }
//   })
//  ),  
//  check('profileImg').optional(), 

//  check('phone').optional().isMobilePhone(['ar-EG','ar-SA'])
//  .withMessage('invalid phone numper only accepted Egy and SA phone numbers'),

//  check('role').optional(), 
   

//     validatorMiddleware
// ];

// exports.changeOrphanagePasswordValidator =[
//   check('id').isMongoId().withMessage('Invalid Orphanage ID format'),
//    body('currentPassword')
//    .notEmpty()
//    .withMessage('You must enter your current password'),
//    body('passwordConfirm')
//    .notEmpty()
//    .withMessage('you must enter the password confirm'),
//    body('password')
//    .notEmpty()
//    .withMessage('you must enter new password ')
//    .custom(async (val, {req}) => {
//     //1- varify current password
//     const orphanage = await Orphanage.findById(req.params.id);
//     if(!orphanage){
//       throw new Error('There is no Orphanage for this id')
//     }
//   const isCorrectPassword = await  bcrypt.compare
//   (req.body.currentPassword ,
//      orphanage.password
//     );
//    if(!isCorrectPassword) {
//     throw new Error('Incorrect current password')
//    } 
//     //2-  varify password confirm
//     if(val !== req.body .passwordConfirm){
//       throw new Error('password confirmation incorrect')  
//     }
//     return true;
//    }),
//    validatorMiddleware
//   ];

// exports.deleteOrphanageValidator = [
//   check('id')
//     .isMongoId().withMessage('Invalid Orphanage ID format'),
//   validatorMiddleware
// ];
