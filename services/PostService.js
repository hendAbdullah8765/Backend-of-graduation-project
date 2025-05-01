const sharp = require ('sharp');
const {v4: uuidv4} = require('uuid');
const asyncHandler = require ('express-async-handler')
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
exports.resizePostImages = asyncHandler(async (req, res, next) =>{
 // 1-image processing for image
  if  (req.files.image){
    const imageFileName = `post-${uuidv4()}-${Date.now()}.jpeg`;
   await sharp(req.files.image[0].buffer )
    .resize(2000 , 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`upload/posts/${imageFileName}`);
//save image into our db
  req.body.image = imageFileName;
  }
 // 2-image processing for images
 if  (req.files.images){
  req.body.images = [];
 await Promise.all( 
   req.files.images.map(async(img , index) => {
  const imageName = `post-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  await sharp(img.buffer)
   .resize(2000 , 1333)
   .toFormat("jpeg")
   .jpeg({ quality: 90 })
   .toFile(`upload/posts/${imageName}`);
//save image into our db
 req.body.images.push(imageName) 
})
)
  next();
 }
})

// @desc  get list of Post
// @route Get /api/v1/posts
// @access Public
exports.getPosts = factory.getAll(Post , 'Post');


// @desc  get spacific Post by id
// @route Get /api/v1/posts/:id  
// @access Public
exports.getPost = factory.getOne(Post);
  
// @desc  create Post
// @route Post /api/v1/posts 
// @access Private
exports.createPost = factory.createOne(Post);


// @desc  update spacific Post
// @route Put /api/v1/posts/:id
// @access Public

exports.updatePost = factory.updateOne(Post);


// @desc  delete spacific Post
// @route delete /api/v1/posts/:id
// @access Public
exports.deletePost = factory.deleteOne(Post);
