const express = require('express');
const {
    createComment,
    getComments,
    getComment,
    updateComment,
    deleteComment,
    setPostIdToBody,
    createFilterObj
  } = require('../services/CommentService');

const {
  createCommentValidator,
  getCommentValidator,
  updateCommentValidator,
  deleteCommentValidator
} = require('../utils/validators/commentValidator')
 
// mergeParams: Allow us to access parameters on other routers
// ex: We need to access postId from post router
const router = express.Router({mergeParams: true });

router
.route('/')
.post(setPostIdToBody ,createCommentValidator,createComment)
.get(createFilterObj,getComments);

router
.route('/:id')
.get(getCommentValidator ,getComment)
.put(updateCommentValidator ,updateComment)
.delete(deleteCommentValidator ,deleteComment);
module.exports = router;