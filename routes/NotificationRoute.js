const express = require("express");
const authService = require("../services/authService");
const {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../services/NotificationService");
const {
  createNotificationValidator,
  getNotificationValidator,
  updateNotificationValidator,
  deleteNotificationValidator,
} = require("../utils/validators/notificationValidator");

const router = express.Router();

router.use(authService.protect);

router
  .route("/")
  .get(getNotifications)
  .post(createNotificationValidator, createNotification);

router
  .route("/:id")
  .get(getNotificationValidator, getNotification)
  .put(updateNotificationValidator, updateNotification)
  .delete(deleteNotificationValidator, deleteNotification);

module.exports = router;
