const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler')
const Message = require('../models/MessageModel'); // موديل الرسالة
const { uploadMixOfImages } = require('../middlewares/uploadImagesMiddleware')
const { sendMessageNotification } = require('./NotificationService');
const Chat = require("../models/chatModel"); // تأكدي إن ده موجود

exports.uploadMessageImages = uploadMixOfImages([
  {
    name: 'image',
    // maxCount: 1
  },
])
//image processing 
exports.resizeMessageImages = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.image) {
    const imageFileName = `message-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.image[0].buffer)
      // .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`upload/messages/${imageFileName}`);
    req.body.image = imageFileName;
  }

  next();
});

exports.sendMessage = async ( senderId, receiverId, message, image) => {
   
  let finalChatId 

    if (senderId && receiverId) {

      let existingChat = await Chat.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (!existingChat) {
        existingChat = await Chat.create({
          members: [senderId, receiverId],
        });
      }

    finalChatId = existingChat._id;
    }

    // إنشاء الرسالة
    const newMessage = await Message.create({
      chatId: finalChatId,
      senderId,
      receiverId,
      message,
      image,
    });

    // Populate للرد النهائي
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("chatId")
      .populate("senderId", "name email image");

    return populatedMessage
  
};


// ✅ جلب كل الرسائل داخل شات
exports.getMessages = async (senderId, receiverId) => {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image');
    
      return messages
  
};


// ✅ تعليم الرسائل بأنها "مرئية"
exports.markMessagesAsSeen = async (chatId,  userId) => {

  
    await Message.updateMany(
      {
        chatId,
        receiverId: userId,
        isSeen: false,
      },
      { isSeen: true }
    );
  }
  
exports.deleteMessage = async (req, res) => {
  const  messageId  = req.params.id;

  try {
    const deleted = await Message.findByIdAndDelete(messageId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
