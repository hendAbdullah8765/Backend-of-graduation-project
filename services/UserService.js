const sharp = require ('sharp');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');
const asyncHandler = require ('express-async-handler')
const factory = require('./handlerFactory');
const User = require('../models/UserModel');
const Orphanage = require('../models/OrphanageModel')
const ApiError = require('../utils/ApiError');
const GenerateToken = require('../utils/createToken')
const Message = require('../models/MessageModel');
const Post = require('../models/PostModel');
const {uploadSingleImage} = require ('../middlewares/uploadImagesMiddleware')

//upload single image
exports.uploadUserImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file ) {
    const imageFileName = `users-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`upload/users/${imageFileName}`);
    req.body.image = imageFileName;
  }
  next();
});


   // @desc  get list of users
   // @route Get /api/v1/users
   // @access private
exports.getUsers = factory.getAll(User , 'User');


// @desc  get specific user by id (with posts and messages)
// @route Get /api/v1/users/:id
// @access private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password');  

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const posts = await Post.find({ user: user._id }) 
    .select('content createdAt'); 

  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: user._id }, 
      { senderId: user._id, receiverId: req.user._id }, 
    ],
  }).sort({ createdAt: 1 });



  res.status(200).json({
    data: {
      user,
      posts,  
      messages, 
    },
  });
});



   // @desc  add user
   // @route user /api/v1/user 
   // @access Private
  exports.createUser = factory.createOne(User);

   // @desc  update spacific user 
   // @route Put /api/v1/users/:id
   // @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
   const document = await User.findByIdAndUpdate
   (req.params.id,{
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      image: req.body.image,
      role: req.body.role
   },
   {
     new: true,
   });
   if (!document) {
     return next(
       new ApiError(`No document for this id ${req.params.id}`, 404)
     );
   }
   res.status(200).json({ data: document });
 });

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
   const document = await User.findByIdAndUpdate
   (req.params.id,{
      password: await bcrypt.hash( req.body.password , 12),
      passwordChangedAt: Date.now()
    },
   {
     new: true,
   });
   if (!document) {
     return next(
       new ApiError(`No document for this id ${req.params.id}`, 404)
     );
   }
   res.status(200).json({ data: document });
 });

   // @desc  delete spacific user  
   // @route delete /api/v1/user/:id
   // @access private
exports.deleteUser = factory.deleteOne(User);

 // @desc  get logged user 
 // @route Get /api/v1/users/getMe
 // @access private
exports.getLoggedUserData = asyncHandler(async(req, res, next) => {
  req.params.id = req.user._id;
  next()
});

 // @desc  update logged user pass
 // @route put /api/v1/users/updateMyPassword
 // @access private
exports.updateLoggedUserPassword = asyncHandler(async(req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
     password: await bcrypt.hash( req.body.password , 12),
     passwordChangedAt: Date.now()
   },
  {
    new: true,
  });

  const token = GenerateToken(user._id)

  res.status(200).json({ data: user , token})

 })

  // @desc  update logged user data(without role , password)
 // @route put /api/v1/users/updateMe
 // @access private
 exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const {   
    name,
    adminName, 
    email,
    phone,
    address,
    currentChildren,
    totalCapacity,
    staffCount,
    workDays,          
    workHours,
    establishedDate,
    birthdate,
    gender,
    image,
  } = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    name,
    email,
    phone,
    address,
    birthdate,
    gender,
    image,
  }, { new: true });

  if (updatedUser.role === 'Orphanage') {
    const updatedOrphanage = await Orphanage.findByIdAndUpdate(updatedUser.orphanage, {
      adminName,
      currentChildren,
      totalCapacity,
      staffCount,
      workSchedule: {
        workDays,
        workHours,
      },
      establishedDate,
    }, { new: true });

    return res.status(200).json({
      data: {
        user: updatedUser,
        orphanage: updatedOrphanage,
      },
    });
  }

  res.status(200).json({
    data: updatedUser,
  });
});


 // @desc  Deactivate logged user
 // @route Delete /api/v1/users/deleteme
 // @access private
exports.deleteLoggedUserData = asyncHandler(async(req, res, next) => {
   await User.findByIdAndUpdate(req.user._id , { active: false})
  
   res.status(200).json({status: 'success'})
}) 

exports.reActivateUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(200).json({ status: 'Account reactivated successfully' });
});
