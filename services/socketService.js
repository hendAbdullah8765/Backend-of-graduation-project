const { Server } = require("socket.io");
const { getuserChatsForSocket } = require("./chatService");
const { Messages } = require("../models/MessageModel");
const { sendMessage } = require("./MessageService");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const OnlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);


    // عند فتح التطبيق
    socket.on("OpenApp", async ({ userId }) => {
       console.log(" OpenApp event received from user:", userId);
      if (!userId) return;

      if (!OnlineUsers.has(userId)) {
        OnlineUsers.set(userId, []);
      }

      OnlineUsers.get(userId).push(socket.id);

      const onlineUserIds = [...OnlineUsers.keys()];
      const chats = await getuserChatsForSocket(userId, onlineUserIds);
      console.log(" Chats fetched:", chats);
      socket.emit("GetChats", chats);
    });

    // إرسال رسالة

socket.on("SendMessage", async ( messageData ) => {
  console.log("incoming message",messageData)
  try {
    console.log("message from socket" ,messageData)
    const newMessage = await sendMessage(messageData);

    const onlineUserIds = [...OnlineUsers.keys()];
    const senderSockets = OnlineUsers.get(messageData.senderId) || [];
    const receiverSockets = OnlineUsers.get(messageData.receiverId) || [];

    [...senderSockets, ...receiverSockets].forEach((socketId) => {
      io.to(socketId).emit("getMessage", newMessage);
    });

    // تحديث الشاتات بعد الإرسال
    const userIds = [messageData.senderId, messageData.receiverId];
    await Promise.all(
      userIds.map(async (userId) => {
        const sockets = OnlineUsers.get(userId) || [];
        const updatedChats = await getuserChatsForSocket(userId, onlineUserIds);

        sockets.forEach((sockId) => {
          io.to(sockId).emit("GetChats", updatedChats);
        });
      })
    );
  } catch (err) {
    console.error("SendMessage Error:", err.message);
 }
});


    // عند الخروج أو غلق التطبيق
    socket.on("disconnect", () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const [userId, sockets] of OnlineUsers.entries()) {
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            OnlineUsers.delete(userId);
          } else {
            OnlineUsers.set(userId, sockets);
          }
          break;
        }
      }
    });
  });
};

module.exports = initializeSocket;
