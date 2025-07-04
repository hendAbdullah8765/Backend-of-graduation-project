const moment = require("moment-timezone");
const ChatModel = require("../models/chatModel");
const Message = require("../models/MessageModel");
const User =require("../models/UserModel")
// ✅ إنشاء شات بين شخصين
exports.createChat = async (req, res) => {
  try {
    const { firstId, secondId } = req.body;

    const existingChat = await ChatModel.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (existingChat)
      return res.json({
        Message: "Already exists",
        Chat: existingChat,
        success: false,
      });

    const newChat = await ChatModel.create({
      members: [firstId, secondId],
    });

    return res.json({
      Message: "Chat Started",
      Chat: newChat,
      success: true,
    });
  } catch (err) {
    return res.json({ message: err.message, status: "error" });
  }
};

// ✅ جلب كل الشاتات الخاصة بمستخدم
exports.userAllChats = async (req, res) =>  {
  try {
    const { id } = req.params;

    const AllChats = await ChatModel.find({
      members: { $in: [id] },
    }).populate("members", "name email image");

    const AllMessages = await Message.find().select
    ("message image isSeen chatId senderId createdAt");

    // Create Latest Chat And Messages array
    const LatestChatAndMessages = AllChats.map((chat) => {
      const chatMessages = AllMessages.filter(
        (message) => message.chatId?.toString() === chat.id.toString()
      );

      chatMessages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
        const lastMessage = chatMessages[0];

        const otherUser = chat.members.find(
    (member) => member?._id?.toString() !== id?.toString()
  );

  const notSeenNumber = chatMessages.filter(
    (message) =>
      !message.isSeen && message.senderId?.toString() !== id?.toString()
  ).length;

      return {
        chatId: chat.id,
        lastMessage :lastMessage
      ? {
          text: lastMessage.message,
          image: lastMessage.image,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          isSeen: lastMessage.isSeen,
        }
      : null,
      chatMessages,
    friend: {
  _id: otherUser._id,
  name: otherUser.name,
  email: otherUser.email,
  image: otherUser.image ||null,
},
    notSeenNumber,
      };
    });

    return res.json({
      success: true,
      Message: "All User Chats",
      results: LatestChatAndMessages.length,
      chats: LatestChatAndMessages,
    });
  } catch (err) {
    return res.json({ message: err.message, status: "error", success: false });
  }
};



// ✅ جلب شات معين بين شخصين
exports.getUserChat = async (req, res) => {
  try {
    const { firstId, secondId } = req.body;

    const chat = await ChatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    const friendId = chat.members.find(
  memberId => memberId.toString() !== req.user._id.toString()
);
const friend = await User.findById(friendId).select('name email image');
const messages = await Message.find({ chatId: chat._id });
const notSeenCount = messages.filter(
  msg => !msg.isSeen && msg.senderId.toString() !== req.user._id.toString()
).length;


    return res.json({
      Message: "Chat fetched",
      friend,
      notSeenCount,
      messages,
      Chat: chat,
      success: true,
    });
  } catch (err) {
    return res.json({ message: err.message, status: "error", success: false });
  }
};

// ✅ حذف شات (soft delete لكل شخص)
exports.deleteUserChat = async (req, res) => {
  try {
    const { id, chatId } = req.params;

    const chat = await ChatModel.findById(chatId);
    if (!chat)
      return res.json({
        Message: "Chat not found",
        success: false,
      });

    await ChatModel.findOneAndUpdate(
      { _id: chatId, userDelete: { $ne: id } },
      { $push: { userDelete: id } },
      { new: true }
    );

    const updatedChat = await ChatModel.findById(chatId);

    if (updatedChat.userDelete.length === updatedChat.members.length) {
      await ChatModel.findByIdAndDelete(chatId);
      await Message.deleteMany({ chatId });
    }

    return res.json({
      Message: "Chat marked as deleted",
      success: true,
    });
  } catch (err) {
    return res.json({ message: err.message, status: "error", success: false });
  }
};

// ✅ جلب أحدث الشاتات والمحادثات (للسوكت)
exports.getuserChatsForSocket = async (id, onlineUserIds) => {
  const [allChats, allMessages] = await Promise.all([
    ChatModel.find({ members: id, userDelete: { $ne: id } }).populate(
      "members",
      "name email image"
    ),
    Message.find().select("message image isSeen chatId senderId createdAt"),
  ]);

  const formattedChats = await Promise.all(
  allChats.map(async (chat) => {
    const messages = allMessages.filter(
      (msg) => msg.chatId.toString() === chat.id.toString()
    );

    if (!messages.length) return null;

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const lastMessage = messages[0];

    // ✅ نجيب معلومات المرسل
    const sender = await User.findById(lastMessage.senderId).select("name image");

    const latestMsg = {
      text: lastMessage.message || null,
      image: lastMessage.image || null,
      createdAt: moment(lastMessage.createdAt)
        .tz("Africa/Cairo")
        .format("YYYY-MM-DD HH:mm:ss"),
      senderId: lastMessage.senderId,
      senderImage: sender?.image || null,
      isSeen: lastMessage.isSeen,
      isSender: lastMessage.senderId.toString() === id.toString(),
    };

    const otherUser = Array.isArray(chat.members)
      ? chat.members.find(
          (member) =>
            member &&
            member._id &&
            member._id.toString() !== id.toString()
        )
      : null;

    if (!otherUser) return null;

    const notSeenCount = messages.filter(
      (msg) => !msg.isSeen && msg.senderId.toString() !== id.toString()
    ).length;

    return {
      chatId: chat.id,
      lastMessage: latestMsg,
      user: otherUser,
      notSeenCount,
      isOnline: onlineUserIds.includes(otherUser._id.toString()),
    };
  })
);
  const cleaned = formattedChats.filter(Boolean);

  cleaned.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  return {
    Chats: cleaned,
    success: true,
  };
};
