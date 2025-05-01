const asyncHandler = require ('express-async-handler');

const Follow = require('../models/followModel');

  // @desc    Get pages followed by a user
  // @route   GET /api/v1/follows/:userId
  // @access  Public / or Private
  exports.getFollowedPages = asyncHandler(async (req, res) => {
    const follows = await Follow.find({ userId: req.params.userId }).populate('pageId');
    res.status(200).json({
      results: follows.length,
      data: follows
    });
  });

  // @desc    Get users following a page
// @route   GET /api/v1/follows/page/:pageId
// @access  Public / or Private
exports.getUsersFollowingPage = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ pageId: req.params.pageId }).populate('userId');

  const users = follows.map(follow => follow.userId); 

  res.status(200).json({
    results: users.length,
    data: users
  });
});

  // @desc    Follow a page
  // @route   POST /api/v1/follows
  // @access  Private
  exports.followPage = asyncHandler(async (req, res) => {
    const { userId, pageId } = req.body;
  
    const follow = await Follow.create({ userId, pageId });
  
    res.status(201).json({ data: follow });
  });
  
  // @desc    Unfollow a page
  // @route   DELETE /api/v1/follows
  // @access  Private
  exports.unfollowPage = asyncHandler(async (req, res) => {
    const { userId, pageId } = req.body;
  
    const result = await Follow.findOneAndDelete({ userId, pageId });
  
    if (!result) {
      return res.status(404).json({ message: 'Follow not found' });
    }
  
    res.status(200).json({ message: 'Unfollowed successfully' });
  });
  

  