const express = require('express');
const {
    getFollowedPages,
    getUsersFollowingPage,
    followPage ,
    unfollowPage ,

  } = require('../services/FollowService');

const {
  createFollowValidator,
  getFollowValidator,
  deleteFollowValidator
} = require('../utils/validators/FollowValidator')
 
// mergeParams: Allow us to access parameters on other routers
// ex: We need to access postId from post router
const router = express.Router({mergeParams: true });

router
.route('/')
.post(createFollowValidator,followPage)
.get(getFollowedPages, getUsersFollowingPage,);

router
.route('/:id')
.get(getFollowValidator , getFollowedPages, getUsersFollowingPage)
.delete(deleteFollowValidator ,unfollowPage);
module.exports = router;