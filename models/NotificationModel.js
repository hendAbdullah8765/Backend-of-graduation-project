const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["comment", "follow", "donation", "adoption_request"],
    required: true,
  },
  relatedId: { type: Schema.Types.ObjectId, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Optionally, you can add a virtual to populate related model based on `type`.
module.exports = mongoose.model("Notification", notificationSchema);
