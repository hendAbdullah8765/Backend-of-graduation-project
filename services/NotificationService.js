const factory = require("./handlerFactory");
const Notification = require("../models/NotificationModel");

exports.getNotifications = factory.getAll(Notification);
exports.getNotification = factory.getOne(Notification);
exports.createNotification = factory.createOne(Notification);
exports.updateNotification = factory.updateOne(Notification);
exports.deleteNotification = factory.deleteOne(Notification);
