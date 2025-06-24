const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // صاحب الإشعار
  senderId: { type: Schema.Types.ObjectId, ref: "User" }, // من قام بالفعل (لو applicable)
  type: {
    type: String,
    enum: ["React", "Repost","Message", "donation", "adoption_request"],
    required: true,
  },
  relatedId: { type: Schema.Types.ObjectId, required: true }, // ID العنصر المرتبط زي post أو user
  message: { type: String }, // اختياري
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
