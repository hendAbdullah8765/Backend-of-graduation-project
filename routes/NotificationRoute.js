const express = require("express");
const authService = require("../services/authService");
const {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../services/NotificationService");
const {
  deleteNotificationValidator,
} = require("../utils/validators/notificationValidator");

const router = express.Router();

router.use(authService.protect);

// جلب إشعارات المستخدم
router.get('/', getUserNotifications);

// تعليم إشعار أنه تمت قراءته
router.patch('/:id/read', markNotificationAsRead);

// حذف إشعار معين
router.delete('/:id',deleteNotificationValidator, deleteNotification);

// حذف كل الإشعارات
router.delete('/', clearAllNotifications);
module.exports = router;
