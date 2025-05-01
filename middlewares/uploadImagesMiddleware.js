const multer = require('multer');
const ApiError = require('../utils/ApiError');

const multerOptions = () => {
     // //diskStorage engine
// const multerStorage = multer.diskStorage({
//     destination: function(req, file, cb ){
//         cb(null, 'upload/posts')
//     },
//    filename: function (req, file, cb) {
//     //post-${id}-Date.now().jpeg
//     const ext = file.mimetype.split('/')[1];
//     const filename = `post-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, filename);
//    },
// });
 const multerStorage = multer.memoryStorage()
 
 const multerFilter = function(req, file, cb ){
    if (file.mimetype.startsWith('image')){
        cb(null, true);
    }else{
        cb(new ApiError('Only images allowed',400), false)
    }
} 
const upload = multer({storage: multerStorage, fileFilter: multerFilter });
  return upload;
};
exports.uploadSingleImage = (fieldName) =>  multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) => multerOptions().fields(arrayOfFields)
