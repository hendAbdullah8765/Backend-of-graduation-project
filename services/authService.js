const crypto = require("crypto");
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const GenerateToken = require("../utils/createToken");
const User = require("../models/UserModel");
const Orphanage = require("../models/OrphanageModel");
const Post = require('../models/PostModel')
const AdoptionRequest = require('../models/AdoptionRequestModel')
const DonationItem = require('../models/DonationItemModel')
const Donation = require('../models/DonationModel')
const Notification = require('../models/NotificationModel')
const Setting = require('../models/SettingsModel')
const Child = require('../models/ChildModel')
const Message = require('../models/MessageModel')
const { uploadSingleImage } = require('../middlewares/uploadImagesMiddleware')

//upload single image
exports.uploadUserImage = uploadSingleImage("image");

//image processing

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imageFileName = `users-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).rotate()
      // .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`upload/users/${imageFileName}`);
    req.body.image = imageFileName;
  }
  next();
});

// @desc  signup
// @route Get /api/v1/auth/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  const {
    name,
    password,
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
    image,
    birthdate,
    gender,
    notificationToken,
    role,
  } = req.body;

  const workSchedule = {
    workDays: workDays || [],
    workHours: workHours || [],
  };
  // 1- Create the user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    birthdate,
    gender,
    notificationToken,
    image,
  
    role: role || "Donor",
  });

  let orphanage = null;

  // 2- Orphanage
  if (role === "Orphanage") {
    orphanage = await Orphanage.create({
      name,
      adminName,
      email,
      password,
      phone,
      address,
      currentChildren,
      totalCapacity,
      staffCount,
      image,
      workSchedule: {
        workDays: workSchedule?.workDays || [],
        workHours: workSchedule?.workHours || [],
      },
      establishedDate,
      birthdate,
      notificationToken
    });
  }
  if (orphanage) {
    user.orphanage = orphanage._id;
    await user.save();
  }
  //3- Generate Token
  const token = GenerateToken(user._id);

  // 4- Response
  res.status(201).json({
    data: { user, orphanage },
    token,
  });
});

// @desc  login
// @route Get /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, notificationToken } = req.body;

  // 1. جلب المستخدم مع الباسورد
  const user = await User.findOne({ email })
    .select('+password')
    .populate('orphanage');

  // 2. تحقق من الوجود والباسورد
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 3. لو وصلنا notificationToken وجديد أو مختلف، حدّثه
  if (notificationToken && user.notificationToken !== notificationToken) {
    user.notificationToken = notificationToken;
try {
    await user.save();
    console.log('Notification token updated!');
  } catch (err) {
    console.error('Error saving user:',err);
 }  }

  // 4. توليد توكن الجلسة
  const token = GenerateToken(user._id);

  // 5. باقي البيانات اللي بترجعها
  const posts = await Post.find({ user: user._id });
  const requests = await AdoptionRequest.find({ orphanage: user._id });
  const donationItems = await DonationItem.find({ userId: user._id })
    .populate('orphanageId', 'name');
  const donation = await Donation.find({ userId: user._id })
    .populate('orphanageId', 'name');
  const notification = await Notification.find({ userId: user._id })
    .populate('orphanageId', 'name');
  const settings = await Setting.find({ userId: user._id })
    .populate('orphanageId', 'name');

  let children = [];
  if (user.role === 'Orphanage') {
    children = await Child.find({ orphanage: user._id });
  }

  const messages = await Message.find({
    $or: [{ senderId: user._id }, { receiverId: user._id }]
  })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');

  // 6. أرجع الـ response
  res.status(200).json({
    token,
    data: {
      user: {
        ...user.toObject(),
        image: user.image,
      },
      posts,
      children,
      requests,
      messages,
      donationItems,
      donation,
      notification,
      settings
    }
  });
});


// make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //1- check if token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, please login to get access this route",
        401
      )
    );
  }

  //2- verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // 3- check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser || currentUser.active === false) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4- check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    //password changed after token created (error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again...",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

// ['admin', ' Orphanage']
exports.allowedTo = (...role) =>
  asyncHandler(async (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc  forgotPassword
// @route post /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user whith that email ${req.body.email}`, 404)
    );
  }
  // generate  hash reset random 6 digits
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hash password reset code in db
  user.passwordResetCode = hashedResetCode;
  //add expire time 10 min
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3- send email
  const message = `Hi ${user.name},\n We received a request to reset the password on your SAVE_ME Account. \n ${resetCode} \n Enter this code to complete the reset. \n The SAVE_ME Team `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetExpire = undefined;
    user.passwordResetVerified = undefined;
    user.passwordResetCode = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to your email" });
});

// @desc  verifyPassResetCode
// @route post /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
  });
});

// @desc  Reset password
// @route post /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1-get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }
  //2- check reset code
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not varified", 404));
  }

  user.password = req.body.newPassword;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;
  user.passwordResetCode = undefined;

  await user.save();

  //3- generate token if evry thing is ok
  const token = GenerateToken(user._id);
  res.status(201).json({ token });
});
