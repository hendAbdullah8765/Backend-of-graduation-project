const mongoose = require("mongoose");

const { Schema } = mongoose;

const adoptionRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },

  reason: { type: String },
  phone: { type: String },
  location: { type: String },
  monthlyIncome: { type: Number },
  occupation: { type: String },

  birthDate: { type: Date }, // ✅ ضيفي ده
  religion: { type: String }, // ✅ ضيفي ده
  maritalStatus: { type: String }, // ✅ الاسم الصحيح، انتي كنتِ كاتبة martialStatus

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});


// auto-stamp updatedAt
adoptionRequestSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
