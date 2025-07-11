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
    required: true,
  },

  cardHolderName: { type: String },
  cardNumber: { type: String },
  cvc: { type: String },
  expiryDate: { type: String },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  receiptNumber: {
    type: String,
    unique: true,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", donationSchema);
