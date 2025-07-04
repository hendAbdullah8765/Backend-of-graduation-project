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

exports.sendMessage = async (messageData) => {
  const { chatId, senderId, receiverId, message, image } = messageData;
  console.log("incoming message",messageData)

 if(!senderId || !receiverId){
  throw new Error("sender &recevir are required")
 }

  let finalChatId = chatId;

  // لو مفيش chatId، دوري أو أنشئي واحد
  if (!chatId) {
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

  // أنشئي الرسالة
  const newMessage = await Message.create({
    chatId: finalChatId,
    senderId,
    receiverId,
    message,
    image,
  });
   
  console.log("chat created ",senderId ,receiverId )
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("chatId")
    .populate("senderId", "name email image");

  return populatedMessage;
};


// ✅ جلب كل الرسائل داخل شات
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 }) // ترتيب حسب الأقدم
      .populate('senderId', 'name image') // لو حابة تجيبي بيانات المرسل
      .populate('receiverId', 'name image');

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ تعليم الرسائل بأنها "مرئية"
exports.markMessagesAsSeen = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    await Message.updateMany(
      {
        chatId,
        receiverId: userId,
        isSeen: false,
      },
      { isSeen: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as seen',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
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
