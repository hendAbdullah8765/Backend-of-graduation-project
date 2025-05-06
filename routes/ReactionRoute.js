const express = require('express');
const {
    createReactionValidator,
    getReactionValidator,
    updateReactionValidator,
    deleteReactionValidator
  } = require('../utils/validators/reactionValidator')
   
const {
    createReaction,
    getReactions,
    updateReaction,
    deleteReaction,
    setPostIdToBody,
    createFilterObj ,
    createFilterObject,
    allowedToModifyReaction
  } = require('../services/ReactionService');
 const authService = require('../services/authService')

// mergeParams: Allow us to access parameters on other routers
// ex: We need to access postId from post router
const router = express.Router({mergeParams: true });

router
.route('/')
.post(authService.protect , setPostIdToBody ,createReactionValidator
    ,createReaction)
    .get(createFilterObj, createFilterObject ,getReactions)

router
.route('/:id')
.get(getReactionValidator,getReactions)
.put(authService.protect,allowedToModifyReaction,updateReactionValidator ,updateReaction)
.delete(authService.protect,allowedToModifyReaction,deleteReactionValidator ,deleteReaction);
module.exports = router;
