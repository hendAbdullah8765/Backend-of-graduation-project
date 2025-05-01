const mongoose = require("mongoose");

const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferences: { type: Schema.Types.Mixed, default: {} },
    notificationSettings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
