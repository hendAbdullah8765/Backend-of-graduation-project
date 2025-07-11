const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler')
const factory = require('./handlerFactory');
const Child = require('../models/ChildModel');
const { uploadSingleImage } = require('../middlewares/uploadImagesMiddleware')

//upload single image
exports.uploadChildImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imageFileName = `children-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      // .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`upload/children/${imageFileName}`);
    req.body.image = imageFileName;
  }
  next();
})
// nested route
// Get /api/v1/Orphanages/:OrphanageId/childs
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.userId) filterObject = { orphanage: req.params.userId };
  req.filterObj = filterObject;
  next();
}
// @desc  get list of children
// @route Get /api/v1/children
// @access Public
exports.getChildren = factory.getAll(Child, 'Child', {
  path: 'orphanage',
  select: 'name image'
});

// @desc  get spacific child by id
// @route Get /api/v1/childss/:id
// @access Public
exports.getChild = factory.getOne(Child, {
  path: 'orphanage',
  select: 'name image'
});
// post /api/v1/Orphanages/:OrphanageId/childs
// nested route

exports.setOrphanageIdToBody = (req, res, next) => {
  if (!req.body.orphanage) req.body.orphanage = req.params.userId;
  next();
}

// @desc  add child
// @route child /api/v1/child
// @access Private
exports.addChild = asyncHandler(async (req, res, next) => {
  const {
    name,
    gender,
    eyeColor,
    skinTone,
    hairColor,
    hairStyle,
    religion,
    birthdate,
    image,
    personality
  } = req.body;

  // تأكدي إن المستخدم دار أيتام وعنده Orphanage ID
  if (req.user.role !== 'Orphanage' || !req.user.orphanage) {
    return res.status(403).json({ success: false, message: "Only orphanage users can create children" });
  }

  const newChild = await Child.create({
    name,
    gender,
    eyeColor,
    skinTone,
    hairColor,
    hairStyle,
    religion,
    birthdate,
    image,
    personality,
    orphanage: req.user.orphanage, // ID للدار مأخوذ من التوكن
  });

  res.status(201).json({ success: true, data: newChild });
});


// @desc  update spacific child 
// @route Put /api/v1/childs/:id
// @access Private

exports.updateChild = factory.updateOne(Child, {
  path: 'orphanage',
  select: 'name'
});

// @desc  delete spacific Post 
// @route delete /api/v1/posts/:id
// @access Public
exports.deleteChild = factory.deleteOne(Child);
