const express = require('express');
const {
    signup , login ,forgotPassword,
     verifyPassResetCode,resetPassword
  } = require('../services/authService');

const {
  signupValidator , loginValidator    
} = require('../utils/validators/authValidator')
 
const router = express.Router();

router.route('/forgotPassword').post(forgotPassword)
router.route('/verifyResetCode').post(verifyPassResetCode)
router.route('/signup').post(signupValidator, signup)
router.route('/login').post(loginValidator, login)
router.route('/resetPassword').put(resetPassword)

// .get(getUsers);

// router
// .route('/:id')
// .get(getUserValidator, getUser)
// .put(
//   uploadUserImage,
//   resizeImage,updateUserValidator,
//   updateUser)
   

// .delete(deleteUserValidator,    
//     deleteUser);
module.exports = router; 