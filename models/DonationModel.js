const mongoose = require("mongoose");

const { Schema } = mongoose;

const donationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orphanageId: {
    type: Schema.Types.ObjectId,
    ref: "Orphanage",
    required: true,
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "paypal"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", donationSchema);
