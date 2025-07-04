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
      required: false
    },
    address: {
      type: String,
      required: false,
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
    
    notificationToken: { type: String },

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
      enum: ["Orphanage", "Donor"],
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
  if (doc.image && !doc.image.startsWith('/upload/users/')) {
    doc.image = `/upload/users/${doc.image}`;
  }

}

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
