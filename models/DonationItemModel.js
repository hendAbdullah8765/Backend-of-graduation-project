const mongoose = require("mongoose");

const { Schema } = mongoose;

const donationItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orphanageId: {
    type: Schema.Types.ObjectId,
    ref: "Orphanage",
    required: true,
  },
  itemType: {
    type: String,
    enum: ["food", "clothes", "toys", "other"],
    required: true,
  },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pending", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DonationItem", donationItemSchema);
