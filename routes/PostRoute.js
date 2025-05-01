const express = require('express');

const {getPostValidator 
      ,createPostValidator 
      ,updatePostValidator 
      ,deletePostValidator
    } = require("../utils/validators/postValidator")

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadPostImages,
  resizePostImages
} = require('../services/PostService');


const router = express.Router();

const CommentsRoute = require('./CommentRoute');
const ReactionsRoute = require('./ReactionRoute');

router.use('/:postId/comments', CommentsRoute)

router.use('/:postId/reactions', ReactionsRoute)

router
.route('/')
.get(getPosts)
.post(  uploadPostImages,
  resizePostImages,createPostValidator ,createPost)

router
  .route('/:id')
  .get( getPostValidator, getPost)
  .put(  uploadPostImages,
    resizePostImages,
    updatePostValidator 
    ,updatePost)
  
    .delete(deletePostValidator ,deletePost);

module.exports = router;


