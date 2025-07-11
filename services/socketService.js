const { Server } = require("socket.io");
const { getuserChatsForSocket } = require("./chatService");
const {
  sendMessage,
  getMessages,
  markMessagesAsSeen,
} = require("./MessageService");
const User = require("../models/UserModel");
const ApiFeatures = require("../utils/ApiFeatures ");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Track the active chat the socket is in
    socket.activeChatId = null;

    // ------------------------------
    // ⿡ User joins their personal room when opening the app
    // ------------------------------
    socket.on("OpenApp", async ({ userId }) => {
      console.log("OpenApp event received from user:", userId);
      if (!userId) return;

      socket.join(userId);
    });

    // ------------------------------
    // ⿢ Get user chats
    // ------------------------------
    socket.on("getChats", async ({ userId }) => {
      console.log("getChats event received from user:", userId);
      if (!userId) return;

      const chats = await getuserChatsForSocket(userId);
      console.log("Chats fetched:", chats);
      socket.emit("GetChats", chats);
    });

    // ------------------------------
    // ⿣ Get messages for a chat & mark as seen, and join the chat room
    // ------------------------------
    socket.on("getMessages", async ({ senderId, receiverId }) => {
      console.log("getMessages event received from:", senderId, receiverId);
      if (!senderId || !receiverId) return;

      try {
        const chats = await getMessages(senderId, receiverId);

        if (chats && chats.length > 0) {
          const { chatId } = chats[0];
          await markMessagesAsSeen(chatId, senderId);
          console.log("Marked messages as seen in chat:", chatId);

          // Join the chat room so we know the user is inside
          socket.join(chatId);
          socket.activeChatId = chatId;
        }

        console.log("Messages fetched:", chats);
        socket.emit("GetMessages", chats);
      } catch (err) {
        console.error("Error in getMessages:", err.message);
        socket.emit("errorMessage", {
          success: false,
          message: "Failed to fetch messages.",
        });
      }
    });

    // ------------------------------
    // ⿤ Join a chat room manually, even without chatId
    // ------------------------------
    socket.on("joinChat", async ({ senderId, receiverId, chatId }) => {
      if (chatId) {
        socket.join(chatId);
        socket.activeChatId = chatId;
      } else if (senderId && receiverId) {
        const chats = await getMessages(senderId, receiverId);
        if (chats && chats.length > 0) {
          const { chatId: foundChatId } = chats[0];
          socket.join(foundChatId);
          socket.activeChatId = foundChatId;
        }
      } else {
        console.log("joinChat: missing data (need chatId or both user IDs)");
      }
    });

    socket.on("leaveChat", ({ chatId }) => {
      if (chatId) {
        socket.leave(chatId);
      }
      socket.activeChatId = null;
    });

    // ------------------------------
    // ⿥ Send a message & broadcast to sender & receiver
    // ------------------------------
    socket.on(
      "SendMessage",
      async ({ senderId, receiverId, message, image }) => {
        try {
          await sendMessage(senderId, receiverId, message, image);

          const chats = await getMessages(senderId, receiverId);
          const { chatId } = chats[0];

          // Check if the receiver is inside the same chat
          const receiverSockets = await io.in(receiverId).fetchSockets();
          let receiverInActiveChat = false;

          // eslint-disable-next-line no-restricted-syntax
          for (const s of receiverSockets) {
            if (s.activeChatId === chatId) {
              receiverInActiveChat = true;
              break;
            }
          }

          if (receiverInActiveChat) {
            console.log(
              "Receiver is inside the chat, mark messages as seen immediately"
            );
            await markMessagesAsSeen(chatId, receiverId);
          }

          // Emit updated messages to both sender & receiver
          io.to(senderId).emit("GetMessages", chats);
          io.to(receiverId).emit("GetMessages", chats);
        } catch (err) {
          console.error("Socket SendMessage error:", err.message);
          socket.emit("errorMessage", {
            success: false,
            message: "Failed to send message.",
          });
        }
      }
    );

socket.on("Search", async ({ userId, query }) => {
      try {
        if (!query || typeof query !== "string") {
          io.to(userId).emit("searchResult", {
            success: false,
            message: "Query parameter is required.",
          });
          return;
        }
        const mongooseQuery = User.find().sort({ createdAt: -1 });

        const apiFeatures = new ApiFeatures(mongooseQuery, { keyword: query });
        apiFeatures.search("User");

        const { mongooseQuery: finalQuery, querySearch } = apiFeatures;

        const users = querySearch
          ? await User.find(querySearch).sort({ createdAt: -1 }).select("name image")
          : await finalQuery.select("name image");

        io.to(userId).emit("searchResult", {
          success: true,
          data: users,
        });

      } catch (err) {
        console.error("Socket Search error:", err.message);
        io.to(userId).emit("searchResult", {
          success: false,
          message: "Failed to perform search.",
        });
      }
    });

// socket.on("Search", async (queryObj) => {
//   try {
//     const filter = {};

//     const query = User.find(filter).sort({ createdAt: -1 });

//     const apiFeatures = new ApiFeatures(query, queryObj)
//       .search("User")
//       .filter()
//       .limitFields();

//     const { mongooseQuery, querySearch } = apiFeatures;

//     const finalQuery = querySearch
//       ? User.find(querySearch).sort({ createdAt: -1 })
//       : mongooseQuery;

//     const users = await finalQuery;

//     socket.emit("searchResult", {
//       success: true,
//       results: users.length,
//       data: users,
//     });
//   } catch (err) {
//     console.error("searchUsers error:", err.message);
//     socket.emit("searchResult", {
//       success: false,
//       message: err.message,
//       data: [],
//     });
//   }
// });

    // ------------------------------
    // ⿦ Disconnect
    // ------------------------------
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;
