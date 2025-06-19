const express = require('express');

const { getPostValidator
  , createPostValidator
  , updatePostValidator
  , deletePostValidator
} = require("../utils/validators/postValidator")

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadPostImages,
  resizePostImages,
  setUserIdToBody,
  allowedToModifyPost,
  createRepost
} = require('../services/PostService');
const authService = require("../services/authService");


const router = express.Router();

const CommentsRoute = require('./CommentRoute');
const ReactionsRoute = require('./ReactionRoute');

router.use('/:postId/comments', CommentsRoute)

router.use('/:postId/reactions', ReactionsRoute)
router.post(
  '/:id/repost',
  authService.protect,
  createRepost
);

router
  .route('/')
  .get(getPosts)
  .post(
    authService.protect,
    uploadPostImages,
    resizePostImages,
    setUserIdToBody,
    // createPostValidator,
    createPost)

router
  .route('/:id')
  .get(getPostValidator, getPost)
  .put(
    authService.protect,
    allowedToModifyPost,
    uploadPostImages,
    resizePostImages,
    updatePostValidator
    , updatePost)

  .delete(
    authService.protect,
    allowedToModifyPost,
    deletePostValidator, deletePost);

module.exports = router;


