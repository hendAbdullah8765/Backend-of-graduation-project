const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
