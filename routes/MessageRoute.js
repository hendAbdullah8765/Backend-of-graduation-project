const express = require("express");
const authService = require("../services/authService");
const {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
} = require("../services/MessageService");
const {
  createMessageValidator,
  getMessageValidator,
  updateMessageValidator,
  deleteMessageValidator,
} = require("../utils/validators/messageValidator");

const router = express.Router();

// all message routes require authentication
router.use(authService.protect);

router.route("/").get(getMessages).post(createMessageValidator, createMessage);

router
  .route("/:id")
  .get(getMessageValidator, getMessage)
  .put(updateMessageValidator, updateMessage)
  .delete(deleteMessageValidator, deleteMessage);

module.exports = router;
