const express = require("express");
const authService = require("../services/authService");
const {
  createChat,
  userAllChats,
  getUserChat,
  deleteUserChat
} = require("../services/chatService");
const {
createChatValidator
} = require("../utils/validators/chatValidation");

const router = express.Router();

// all message routes require authentication
router.use(authService.protect);

router.post("/",createChatValidator, createChat);

// جلب كل الشاتات الخاصة بالمستخدم
router.get("/all/:id", userAllChats);

//  جلب شات معين بين شخصين
router.post("/one", getUserChat);

//  حذف شات (سوفت دليت)
router.delete("/:id/:chatId", deleteUserChat);
module.exports = router;
