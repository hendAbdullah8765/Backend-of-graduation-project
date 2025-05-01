const factory = require('./handlerFactory');
const Comment = require('../models/CommentModel');


// nested route
// Get /api/v1/posts/:postId/comments
exports.createFilterObj = (req , res , next) => {
  let filterObject = {};
  if(req.params.postId) filterObject = { post: req.params.postId};
   req.filterObj = filterObject;
    next();
}
// @desc  get list of comment
// @route Get /api/v1/comments
// @access Public
   exports.getComments = factory.getAll(Comment)
      
  
   // @desc  get spacific Comment by id
   // @route Get /api/v1/comments/:id
   // @access Public
  exports.getComment =factory.getOne(Comment);


   exports.setPostIdToBody =(req, res , next) =>{
     // nested route
    if (!req.body.post)req.body.post = req.params.postId;
      next();
   }
   // @desc  create comment
   // @route Post /api/v1/posts
   // @access Private
   exports.createComment = factory.createOne(Comment);

     // @desc  update spacific comment 
   // @route Put /api/v1/comments/:id
   // @access Public
  
exports.updateComment = factory.updateOne(Comment)

 // @desc  delete spacific comment 
 // @route delete /api/v1/comments/:id
 // @access Public
 exports.deleteComment = factory.deleteOne(Comment);