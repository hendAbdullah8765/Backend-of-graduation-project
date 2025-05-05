const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
      gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },

    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    birthdate: {
      type: Date,
      required: [true, 'Birthdate is required']
    },
    phone: String,

    image: {
      type: String,
      required: false,
    },

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["Orphanage", "Donor", "admin"],
      default: "Donor",
    },
    orphanage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orphanage'
    },
    active: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
    doc.image = imageUrl;
  }
};
// getAll / update / getOne
userSchema.post("init", (doc) => {
  setImageURL(doc);
});
//create
userSchema.post("save", (doc) => {
  setImageURL(doc);
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
