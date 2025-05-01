const mongoose = require("mongoose");

const { Schema } = mongoose;

const adoptionRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// auto-stamp updatedAt
adoptionRequestSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
