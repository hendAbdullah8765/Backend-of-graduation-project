const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler')
const ApiError = require('../utils/ApiError')
const factory = require('./handlerFactory');
const Post = require("../models/PostModel");
const React = require("../models/ReactionModel")
const { sendRepostNotification } = require('./NotificationService');

const { uploadMixOfImages } = require('../middlewares/uploadImagesMiddleware')
//upload single image
exports.uploadPostImages = uploadMixOfImages([
  {
    name: 'image',
    maxCount: 1
  },
  {
    name: 'images',
    // maxCount: 100
  }
])

//image processing 
exports.resizePostImages = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.image) {
    const imageFileName = `post-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.image[0].buffer)
      // .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`upload/posts/${imageFileName}`);
    req.body.image = imageFileName;
  }

  if (req.files && req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `post-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer).rotate()
          // .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 100 })
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

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate([
      {
        path: 'user',
        select: 'name image repostCount'
      },
      {
        path: 'repostedFrom',
        select: 'content user image ',
        populate: {
          path: 'user',
          select: 'name'
        }
      }
    ]);

  const userId = req.user?._id?.toString();

  const postsWithExtras = await Promise.all(
    posts.map(async (post) => {
      // جلب الريأكتات
      const reacts = await React.find({ post: post._id }).populate('user', 'name image');
      const myReact = userId ? reacts.find(r => r.user._id.toString() === userId) : null;

      // جلب عدد الريبوستات اللى اتعملت على البوست دا
      const repostsCount = await Post.countDocuments({ repostedFrom: post._id });

      return {
        ...post.toObject(),
        reactsCount: reacts.length,
        reacts,
        myReact: myReact || null,
        repostsCount // 👈 عدد الريبوستات اللى اتعملت على البوست دا
      };
    })
  );

  res.status(200).json({
    results: postsWithExtras.length,
    data: postsWithExtras
  });
});


// @desc  get spacific Post by id
// @route Get /api/v1/posts/:id  
// @access Public

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    // 1. جلب البوست
    const post = await Post.findById(postId)
      .populate({ path: "user", select: "name image" })
      .populate({
        path: "repostedFrom",
        select: "content user image repostCount",
        populate: { path: "user", select: "name image" },
      });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // 2. حساب عدد الريأكتات
    const reactions = await React.find({ postId }).populate("user", "name image");

    // 3. عدد الريأكتات
    const reactionsCount = reactions.length;

    // 4. تفاصيل المستخدمين اللي عملوا ريأكت
    const reactionUsers = reactions.map((r) => ({
      _id: r.user._id,
      name: r.user.name,
      image: r.user.image,
      type: r.type, // لو عندك أنواع ريأكتات
    }));

    // 5. عدد الريبوستات (لو مش مخزنه مسبقًا)
    const repostCount = await Post.countDocuments({ repostedFrom: postId });

    return res.status(200).json({
      success: true,
      data: {
        ...post._doc,
        reactionsCount,
        reactionUsers,
        repostCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc  create Post
// @route Post /api/v1/posts 
// @access Private
exports.createPost = factory.createOne(Post, {
  path: 'user',
  select: 'name email image'
});


// @desc  update spacific Post
// @route Put /api/v1/posts/:id
// @access Public

exports.updatePost = factory.updateOne(Post, {
  path: 'user',
  select: 'name email image'
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

  const userComment = req.body.content || ""; // محتوى الريبوست من المستخدم

  const repost = await Post.create({
    content: userComment, // دا هو تعليق المستخدم على الريبوست
    user: req.user._id,
    image: originalPost.image,
    images: originalPost.images,
    repostedFrom: originalPost._id,
    slug: `${originalPost.slug}-repost`
  });

  originalPost.repostCount += 1;
  await originalPost.save();

  await repost.populate([
    {
      path: 'repostedFrom',
      select: 'content user image',
      populate: {
        path: 'user',
        select: 'name email image'
      }
    },
    {
      path: 'user',
      select: 'name email image'
    }
  ]);

  if (repost.user?.image && !repost.user.image.startsWith('/upload/users')) {
  repost.user.image = `/upload/users/${repost.user.image}`;
}

if (originalPost.user.toString() !== req.user._id.toString()) {
    console.log("Sending Repost Notification");
    await sendRepostNotification(req.user._id, originalPost.user, repost._id);
  }


  res.status(201).json({ data: repost });
});



exports.getSavedPosts = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "postIds must be a non-empty array",
      });
    }
    const posts = await Post.find({ _id: { $in: postIds } })
      .sort({ createdAt: -1 })
      .populate([
      {
        path: 'user',
        select: 'name image repostCount'
      },
      {
        path: 'repostedFrom',
        select: 'content user image ',
        populate: {
          path: 'user',
          select: 'name'
        }
      }
    ]);
    const userId = req.user?._id?.toString();

  const postsWithExtras = await Promise.all(
    posts.map(async (post) => {
      const reacts = await React.find({ post: post._id }).populate('user', 'name image');
      const myReact = userId ? reacts.find(r => r.user._id.toString() === userId) : null;

      const repostsCount = await Post.countDocuments({ repostedFrom: post._id });

      return {
        ...post.toObject(),
        reactsCount: reacts.length,
        reacts,
        myReact: myReact || null,
        repostsCount // 👈 عدد الريبوستات اللى اتعملت على البوست دا
      };
    })
  );

  res.status(200).json({
  success: true,
  count: postsWithExtras.length,
  data: postsWithExtras
});


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
