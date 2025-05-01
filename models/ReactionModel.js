const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", 
        required: true
    },
    type: {
        type: String,
        enum: ["like", "love", "sad"], 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
ReactionSchema.pre(/^find/, function(next){
    this.populate({
      path: 'post',
      select: 'userId'
    })
    next();
  }) 

const Reaction = mongoose.model("Reactions", ReactionSchema);

module.exports = Reaction;
