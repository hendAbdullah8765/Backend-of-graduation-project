const express = require("express");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/UserValidator");
const {
  uploadUserImage,
  resizeImage,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  reActivateUser,
} = require("../services/UserService");
const authService = require("../services/authService");



const router = express.Router();

const ReactionsRoute = require('./ReactionRoute');
const childRoute = require('./ChildRoute')
router.use('/:userId/children',childRoute)
router.use('/:userId/reactions', ReactionsRoute)

router.get("/getMe", authService.protect, getLoggedUserData, getUser);

router.put(
  "/changeMyPassword",
  authService.protect,
  changeUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMe",uploadUserImage,
  resizeImage,
  authService.protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.delete("/deleteMe", authService.protect, deleteLoggedUserData);

router.put("/reactiveMe", authService.protect, reActivateUser);

router.put(
  "/changePassword/:id",
  authService.protect,
  authService.allowedTo("admin"),
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .post(  
    uploadUserImage,
    resizeImage,
    authService.protect,
    authService.allowedTo("admin"),
    createUserValidator,
    createUser
  )

  .get(
    authService.protect,
    getUsers
  );

router
  .route("/:id")
  .get(authService.protect,getUserValidator, getUser)
  .put(
    uploadUserImage,
    resizeImage,
    authService.protect,
    authService.allowedTo("admin"),
    updateUserValidator,
    updateUser
  )

  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );
module.exports = router;
