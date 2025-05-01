const express = require("express");
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

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/UserValidator");

const router = express.Router();

const ReactionsRoute = require('./ReactionRoute');

router.use('/:userId/reactions', ReactionsRoute)

router.get("/getMe", authService.protect, getLoggedUserData, getUser);

router.put(
  "/changeMyPassword",
  authService.protect,
  changeUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMe",
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
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  )

  .get(
    authService.protect,
    authService.allowedTo("admin", "Orphange", "Donor"),
    getUsers
  );

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
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
