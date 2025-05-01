const asyncHandler = require("express-async-handler");
// const slugify = require('slugify');
const Reaction = require("../models/ReactionModel");
const factory = require('./handlerFactory');

// nested route
// Get /api/v1/posts/:postId/reactions
exports.createFilterObj = (req , res , next) => {
  let filterObject = {};
  if(req.params.postId) filterObject = { post: req.params.postId};
   req.filterObj = filterObject;
    next();
}

// nested route
// Get /api/v1/users/:userId/reactions
exports.createFilterObject = (req , res , next) => {
  let filterObject = {};
  if(req.params.userId) filterObject = { user: req.params.userId};
   req.filterObj = filterObject;
    next();
}
// @desc  get list of reaction
// @route Get /api/v1/reaction
// @access Public
exports.getReactions = factory.getAll(Reaction);

  
exports.setPostIdToBody = (req, res, next) => {
  // nested route
  if (!req.body.post) req.body.post = req.params.postId;
  next();
};

// @desc  Create or Update Reaction (Smart Management)
// @route POST /api/v1/reactions
// @access Private
exports.createReaction = asyncHandler(async (req, res) => {
  const { type, post, user } = req.body;
  const existingReaction = await Reaction.findOne({ user, post });

  if (existingReaction) {
    existingReaction.type = type;
    await existingReaction.save();
    return res
      .status(200)
      .json({ message: "Reaction updated", data: existingReaction });
  }

  const reaction = await Reaction.create({ type, post, user });

  res.status(201).json({ message: "Reaction added", data: reaction });
});

// @desc  Update Reaction (if not found, create it)
// @route PUT /api/v1/reactions/:id
// @access Private
exports.updateReaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.body;
  const reaction = await Reaction.findByIdAndUpdate(
    id,
    { type },
    { new: true }
  );

  if (!reaction) {
    return exports.createReaction(req, res, next);
  }

  res.status(200).json({ message: "Reaction updated", data: reaction });
});

// @desc  delete spacific reaction
// @route delete /api/v1/reactions/:id
// @access Public
exports.deleteReaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const reaction = await Reaction.findByIdAndDelete(id);

  if (!reaction) {
    return exports.createReaction(req, res, next);
  }
  res.status(204).send();
});
