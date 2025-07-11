const admin = require("../config/firebase.configuration");
const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Donation = require("../models/DonationModel");
const AdoptionRequest = require("../models/AdoptionRequestModel");
const Message = require("../models/MessageModel");

// Helper function to build and send notification
const sendFirebaseNotification = async ({ token, title, body, data = {} }) => {
  console.log(" Sending FCM to:", token);
  console.log(" Payload:", { title, body, data });

  const message = {
    token,
    notification: { title, body },
    data: {
      senderId: data.senderId?.toString(),
      senderName: data.senderName || "",
      senderImage: data.senderImage || "",
      sentAt: data.sentAt || new Date().toISOString(),
      type: data.type || "",
      relatedId: data.relatedId?.toString() || ""
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

  try {
    const response = await admin.messaging().send(message);
    console.log(" FCM sent successfully:", response);
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error(" Error sending FCM:", error);

    if (error.code === "messaging/registration-token-not-registered") {
      console.warn(" Token not registered! You should remove it from your DB:", token);
      // Example:
      // await yourDb.collection("users").doc(userId).update({ fcmToken: FieldValue.delete() });
    }

    // ✅ Return success false, don’t throw
    return {
      success: false,
      error: error.message,
};
}
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
    senderId,
    type,
    relatedId,
  });
 console.log(recipient.notificationToken)
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
exports.sendMessageNotification = async (senderId ,receiverId , message) => createAndSendNotification({
    senderId,
    recipientId: receiverId,
    type: "message",
    relatedId: message._id,
    title: "New Message",
    body: "You received a new message"
  });

// ✅ 3. Donation Notification
exports.sendDonationNotification = async (senderId, orphanageId, donationId, isItem = false) =>
  createAndSendNotification({
    senderId,
    recipientId: orphanageId,
    type: "donation",
    relatedId: donationId,
    title: "New Donation",
    body: isItem ? "You received a new donation item" : "You received a new donation request"
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
      const sender = await User.findById(notif.senderId).select("name image");
        let content = null;

        let actionMessage = "";

    if (notif.type === "React") {
      const post = await Post.findById(notif.relatedId).select("content image");
      content = post ? post.content : null;
      actionMessage = `${sender?.name} reacted to your post`;

    } else if (notif.type === "Repost") {
      const post = await Post.findById(notif.relatedId).select("content image");
      content = post ? post.content : null;
      actionMessage = `${sender?.name} reposted your post`;

    } else if (notif.type === "donation") {
      const donation = await Donation.findById(notif.relatedId).select("amount");
      content = donation ? `Donation: ${donation.amount} EGP` : null;
      actionMessage = `${sender?.name} sent a donation`;

    } else if (notif.type === "adoption_request") {
      const adoption = await AdoptionRequest.findById(notif.relatedId).populate("childId", "name");
      content = adoption?.childId?.name || null;
      actionMessage = `${sender?.name} sent an adoption request`;

    } else if (notif.type === "message") {
      const message = await Message.findById(notif.relatedId).select("message");
      content = message ? message.message : null;
      actionMessage = `${sender?.name} sent you a message`;
    }


          return {
    ...notif,
    senderName: sender?.name,
    senderImage: sender?.image,
    content,
    message: actionMessage
    };

      })
    );
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

    res.status(200).json({
      success: true,
      results: populatedNotifications.length,
      data: populatedNotifications,
      unreadCount
    });
  
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.markNotificationAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get unread notifications count for logged in user
// @route GET /api/v1/notifications/unread-count
// @access Private
exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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

