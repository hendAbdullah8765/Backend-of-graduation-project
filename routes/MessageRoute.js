const express = require("express");
const authService = require("../services/authService");
const {
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  deleteMessage,
  uploadMessageImages,
  resizeMessageImages
} = require("../services/MessageService");
const {
  createMessageValidator,
  deleteMessageValidator,
} = require("../utils/validators/messageValidator");

const router = express.Router();

// all message routes require authentication
router.use(authService.protect);

router.route("/").post(uploadMessageImages,resizeMessageImages ,createMessageValidator, sendMessage);
router.put("/seen", markMessagesAsSeen);
router.get("/:chatId", getMessages);
router
  .route("/:id")
  .delete(deleteMessageValidator, deleteMessage);

module.exports = router;
