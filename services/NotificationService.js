const admin = require("../config/firebase.configuration")
const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Donation = require("../models/DonationModel");
const AdoptionRequest = require("../models/AdoptionRequestModel");
const Message = require("../models/MessageModel");

// Helper function to build and send notification
const sendFirebaseNotification = async ({ token, title, body ,data = {} }) => {
  const message = {
    token,
    notification: { title, body },
     data: {
      ...data,
    },
    android: { priority: "high" },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: "default"
        }
      }
    }
  };
  return await admin.messaging().send(message);
};

// Generic function
const createAndSendNotification = async ({ senderId, recipientId, type, relatedId, title, body }) => {
  const [sender, recipient] = await Promise.all([
    User.findById(senderId).select("name image"),
    User.findById(recipientId).select("notificationToken")
  ]);

  if (!sender || !recipient || !recipient.notificationToken) return;

  await Notification.create({
    userId: recipientId,
    type,
    relatedId,
  });

  return await sendFirebaseNotification({
    token: recipient.notificationToken,
    title,
    body,
    data: {
    senderId: senderId.toString(),
    senderName: sender.name,
    senderImage: sender.image || "",
    sentAt: new Date().toISOString(), // ممكن تعرضي الوقت على الموبايل
    type,
    relatedId: relatedId.toString(),
  }
  });
};

// ✅ 1. React Notification
exports.sendReactNotification = async (senderId, postOwnerId, postId) => createAndSendNotification({
    senderId,
    recipientId: postOwnerId,
    type: "React",
    relatedId: postId,
    title: "New Reaction",
    body: "Someone reacted to your post"
  });

// ✅ 2. Message Notification
exports.sendMessageNotification = async (senderId, message ,receiverId) => createAndSendNotification({
    senderId,
    recipientId: receiverId,
    type: "message",
    relatedId: message._id,
    title: "New Message",
    body: "You received a new message"
  });

// ✅ 3. Donation Notification
exports.sendDonationNotification = async (senderId, orphanageId, donationId) => createAndSendNotification({
    senderId,
    recipientId: orphanageId,
    type: "donation",
    relatedId: donationId,
    title: "New Donation Request",
    body: "You received a new donation request"
  });

// ✅ 4. Adoption Notification
exports.sendAdoptionNotification = async (senderId, orphanageId, adoptionRequestId) => createAndSendNotification({
    senderId,
    recipientId: orphanageId,
    type: "adoption_request",
    relatedId: adoptionRequestId,
    title: "Adoption Request",
    body: "You received a new adoption request"
  });

// ✅ 5. Repost Notification (Optional)
exports.sendRepostNotification = async (senderId, originalPostOwnerId, postId) => createAndSendNotification({
    senderId,
    recipientId: originalPostOwnerId,
    type: "Repost",
    relatedId: postId,
    title: "Post Reposted",
    body: "Someone reposted your post"
  });

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const populatedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        const sender = await User.findById(notif.relatedId).select("name image");
        let content = null;

        if (["React", "Repost"].includes(notif.type)) {
          const post = await Post.findById(notif.relatedId).select("content image");
          content = post ? post.content : null;

        } else if (notif.type === "donation") {
          const donation = await Donation.findById(notif.relatedId).select("amount");
          content = donation ? `Donation: ${donation.amount} EGP` : null;

        } else if (notif.type === "adoption_request") {
          const adoption = await AdoptionRequest.findById(notif.relatedId).populate("childId", "name");
          content = adoption?.childId?.name || null;

        } else if (notif.type === "message") {
          const message = await Message.findById(notif.relatedId).select("message");
          content = message ? message.message : null;
        }

        return {
          ...notif,
          senderName: sender?.name,
          senderImage: sender?.image,
          content,
        };
      })
    );

    res.status(200).json({
      success: true,
      results: populatedNotifications.length,
      data: populatedNotifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.markNotificationAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

