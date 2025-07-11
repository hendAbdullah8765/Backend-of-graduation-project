const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler')
const factory = require('./handlerFactory');
const User = require('../models/UserModel');
const Orphanage = require('../models/OrphanageModel')
const ApiError = require('../utils/ApiError');
const GenerateToken = require('../utils/createToken')
const Message = require('../models/MessageModel');
const Post = require('../models/PostModel');
const React = require("../models/ReactionModel")
const { uploadSingleImage } = require('../middlewares/uploadImagesMiddleware')

//upload single image
exports.uploadUserImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imageFileName = `users-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      // .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`upload/users/${imageFileName}`);
    req.body.image = imageFileName;
  }
  next();
});


// @desc  get list of users
// @route Get /api/v1/users
// @access private
exports.getUsers = factory.getAll(User, 'User');


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
    .populate([
      {
        path: 'user',
        select: 'name image repostCount'
      },
      {
        path: 'repostedFrom',
        select: 'content user image',
        populate: {
          path: 'user',
          select: 'name'
        }
      }
    ]);

  const userId = req.user._id.toString();

  const postsWithExtras = await Promise.all(
    posts.map(async (post) => {
      const reacts = await React.find({ post: post._id }).populate('user', 'name image');
      const myReact = reacts.find(r => r.user._id.toString() === userId);
      const repostsCount = await Post.countDocuments({ repostedFrom: post._id });

      return {
        ...post.toObject(),
        reactsCount: reacts.length,
        reacts,
        myReact: myReact || null,
        repostsCount
      };
    })
  );

  // لو المستخدم دار أيتام، هات بيانات الجدول
  let about = null;
  if (user.role === 'Orphanage') {
    const orphanage = await Orphanage.findById(user.orphanage);
    about = {
      phone: user.phone,
      workDays: orphanage?.workSchedule?.workDays || [],
      workHours: orphanage?.workSchedule?.workHours || "",
      establishedDate: orphanage?.establishedDate || null,
    };
  }
 const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: user._id },
      { senderId: user._id, receiverId: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: {
      user,
      about, // ✅ معلومات الدار (لو موجودة)
      posts: postsWithExtras,
      messages
    }
  });
});



exports.getAllOrphanages = async (req, res) => {
  try {
    const orphanages = await Orphanage.find()
    .select("name image address");

    res.status(200).json({
      success: true,
      results: orphanages.length,
      data: orphanages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc  add user
// @route user /api/v1/user 
// @access Private
exports.createUser = factory.createOne(User);

// @desc  update spacific user 
// @route Put /api/v1/users/:id
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate
    (req.params.id, {
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
    (req.params.id, {
      password: await bcrypt.hash(req.body.password, 12),
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
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const posts = await Post.find({ user: user._id })
    .populate([
      {
        path: 'user',
        select: 'name image repostCount'
      },
      {
        path: 'repostedFrom',
        select: 'content user image',
        populate: {
          path: 'user',
          select: 'name'
        }
      }
    ]);

  const userId = req.user._id.toString();

  const postsWithExtras = await Promise.all(
    posts.map(async (post) => {
      const reacts = await React.find({ post: post._id }).populate('user', 'name image');
      const myReact = reacts.find(r => r.user._id.toString() === userId);
      const repostsCount = await Post.countDocuments({ repostedFrom: post._id });

      return {
        ...post.toObject(),
        reactsCount: reacts.length,
        reacts,
        myReact: myReact || null,
        repostsCount
      };
    })
  );

  let about = null;
  if (user.role === 'Orphanage') {
    const orphanage = await Orphanage.findById(user.orphanage);
    about = {
      phone: user.phone,
      workDays: orphanage?.workSchedule?.workDays || [],
      workHours: orphanage?.workSchedule?.workHours || "",
      establishedDate: orphanage?.establishedDate || null,
    };
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      about, // ✅ معلومات الدار (لو موجودة)
      posts: postsWithExtras
    }
  });
});


// @desc  update logged user pass
// @route put /api/v1/users/updateMyPassword
// @access private
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now()
    },
    {
      new: true,
    });

  const token = GenerateToken(user._id)

  res.status(200).json({ data: user, token })

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
    workSchedule,
    establishedDate,
    birthdate,
    gender,
    image,
  } = req.body;

  // تحديث بيانات اليوزر
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
      phone,
      address,
      birthdate,
      gender,
      image,
    },
    { new: true }
  );

  // لو اليوزر عبارة عن دار أيتام (Orphanage)
  if (updatedUser.role === 'Orphanage') {
    const currentOrphanage = await Orphanage.findById(updatedUser.orphanage);

    const updatedOrphanage = await Orphanage.findByIdAndUpdate(
      updatedUser.orphanage,
      {
        adminName,
        currentChildren,
        totalCapacity,
        staffCount,
        image,
        establishedDate,
        workSchedule: {
          workDays: workSchedule?.workDays || currentOrphanage?.workSchedule?.workDays,
          workHours: workSchedule?.workHours || currentOrphanage?.workSchedule?.workHours,
        }
      },
      { new: true }
    );

    return res.status(200).json({
      data: {
        user: updatedUser,
        orphanage: updatedOrphanage,
      },
    });
  }

  // لو مش دار أيتام، رجع بيانات اليوزر فقط مع التوكن
  const token = GenerateToken(updatedUser._id);

  res.status(200).json({
    data: {
      user: updatedUser,
    },
    token,
 });
});




// @desc  Deactivate logged user
// @route Delete /api/v1/users/deleteme
// @access private
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false })

  res.status(200).json({ status: 'success' })
})

exports.reActivateUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(200).json({ status: 'Account reactivated successfully' });
});

// تحت آخر دالة مثلاً
exports.saveNotificationToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationToken: token },
    { new: true }
  );

  res.status(200).json({ success: true, message: "Token saved", data: user });
});
