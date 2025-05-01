const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true, 
    required: true,
  },
  slug: {
    type: String,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Comments", CommentSchema);
