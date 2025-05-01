const sharp = require ('sharp');
const {v4: uuidv4} = require('uuid');
const asyncHandler = require ('express-async-handler')
const factory = require('./handlerFactory');
const Child = require('../models/ChildModel');
const {uploadSingleImage} = require ('../middlewares/uploadImagesMiddleware')

//upload single image
exports.uploadChildImage = uploadSingleImage("image");

//image processing
exports.resizeImage =asyncHandler(async (req , res, next) => {
 const filename = `children-${uuidv4()}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
    .resize(500 , 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`upload/children/${filename}`);
//save image into our db
  req.body.image = filename;
  
  next();  
})
// nested route
// Get /api/v1/Orphanages/:OrphanageId/childs
exports.createFilterObj = (req , res , next) => {
    let filterObject = {};
    if(req.params.OrphanageId) filterObject = { Orphanage: req.params.OrphanageId};
     req.filterObj = filterObject;
      next();
  }
   // @desc  get list of children
   // @route Get /api/v1/children
   // @access Public
exports.getChildren = factory.getAll(Child);

 // @desc  get spacific child by id
 // @route Get /api/v1/childss/:id
 // @access Public
exports.getChild = factory.getOne(Child);
// post /api/v1/Orphanages/:OrphanageId/childs
    // nested route

exports.setOrphanageIdToBody =(req, res , next) =>{
   if (!req.body.orphanage)req.body.orphanage = req.params.orphanageId;
     next();
  }

   // @desc  add child
   // @route child /api/v1/child
   // @access Private
  exports.addChild = factory.createOne(Child);

   // @desc  update spacific child 
   // @route Put /api/v1/childs/:id
   // @access Private
  
exports.updateChild = factory.updateOne(Child);

   // @desc  delete spacific Post 
   // @route delete /api/v1/posts/:id
   // @access Public
   exports.deleteChild = factory.deleteOne(Child);