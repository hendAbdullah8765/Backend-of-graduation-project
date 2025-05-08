const sharp = require ('sharp');
const {v4: uuidv4} = require('uuid');
const asyncHandler = require ('express-async-handler')
const ApiError = require ('../utils/ApiError')
const factory = require('./handlerFactory');
const Post = require("../models/PostModel");
const {uploadMixOfImages} = require ('../middlewares/uploadImagesMiddleware')
//upload single image
exports.uploadPostImages = uploadMixOfImages([
  {
  name : 'image',
  maxCount : 1
},
{
  name : 'images',
  maxCount : 5 
}
])

//image processing 
exports.resizePostImages = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.image) {
    const imageFileName = `post-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.image[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`upload/posts/${imageFileName}`);
    req.body.image = imageFileName;
  }

  if (req.files && req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `post-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`upload/posts/${imageName}`);
        req.body.images.push(imageName);
      })
    );
  }

  next();  
});

exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.user && req.user) {
    req.body.user = req.user._id;
  }
  next();
};

exports.allowedToModifyPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError('Post not found', 404));
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return next(new ApiError('You are not allowed to modify this post', 403));
  }

  next();
});

// @desc  get list of Post
// @route Get /api/v1/posts
// @access Public
exports.getPosts = factory.getAll(Post, 'Post', [
  {
    path: 'user',
    select: 'name'
  },
  {
    path: 'repostedFrom',
    select: 'content user image repostCount',
    populate: {
      path: 'user',
      select: 'name'
    }
  }
])

// @desc  get spacific Post by id
// @route Get /api/v1/posts/:id  
// @access Public
exports.getPost = factory.getOne(Post, [
  {
    path: 'user',
    select: 'name'
  },
  {
    path: 'repostedFrom',
    select: 'content user image repostCount',
    populate: {
      path: 'user',
      select: 'name'
    }
  }
])
// @desc  create Post
// @route Post /api/v1/posts 
// @access Private
exports.createPost = factory.createOne(Post, {
  path: 'user',
  select: 'name email'
});


// @desc  update spacific Post
// @route Put /api/v1/posts/:id
// @access Public

exports.updatePost = factory.updateOne(Post, {
  path: 'user',
  select: 'name email'
});


// @desc  delete spacific Post
// @route delete /api/v1/posts/:id
// @access Public
exports.deletePost = factory.deleteOne(Post);

// @desc  create a repost
// @route Post /api/v1/posts/:id/repost
// @access Private
exports.createRepost = asyncHandler(async (req, res, next) => {
  const originalPost = await Post.findById(req.params.id);
  if (!originalPost) {
    return next(new ApiError('Original post not found', 404));  
  }

  const repost = await Post.create({
    content: originalPost.content,  
    user: req.user._id,            
    image: originalPost.image,      
    images: originalPost.images,    
    repostedFrom: originalPost._id, 
    slug: originalPost.slug + '-repost'   
  });
  originalPost.repostCount += 1;
  await originalPost.save();
  await repost.populate([
    {
      path: 'repostedFrom',
      select: 'content user image',
      populate: {
        path: 'user',
        select: 'name email'
      }
    },
    {
      path: 'user',
      select: 'name email'
    }
  ]);
  
  res.status(201).json({  data: repost });  
});

