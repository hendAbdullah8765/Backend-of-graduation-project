const mongoose = require("mongoose");

const { Schema } = mongoose;

const donationItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orphanageId: { type: Schema.Types.ObjectId, ref: "Orphanage", required: true },

  itemType: { type: String, enum: ["clothes", "food"], required: true },

  // Clothes
  clothingCondition: { type: String, enum: ["new", "good"] },
  piecesCount: { type: Number },

  // Food
  foodType: { type: String, enum: ["cooked", "dry", "canned"] },
  foodQuantity: { type: String },

  isReadyForPickup: { type: Boolean },
  deliveryMethod: { type: String, enum: ["self_delivery", "home_pickup"], required: true },
  deliveryDate: { type: Date },
  deliveryTime: { type: String },
  deliveryLocation: { type: String },

  receiptNumber: { type: String, unique: true },
  status: { type: String, enum: ["pending", "picked", "delivered"], default: "pending" },

  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("DonationItem", donationItemSchema);
