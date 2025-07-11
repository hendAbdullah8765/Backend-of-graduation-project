const express = require('express');
const {
    getChildren,
    getChild,
    addChild,
    updateChild,
    deleteChild,
    setOrphanageIdToBody,
    createFilterObj,
    uploadChildImage,
    resizeImage
  } = require('../services/ChildService');

  const {
    createChildValidator,
    getChildValidator,
    updateChildValidator,
    deleteChildValidator
} = require('../utils/validators/ChildValidator')

const authService= require('../services/authService') 
// mergeParams: Allow us to access parameters on other routers
// ex: We need to access postId from post router
const router = express.Router({mergeParams: true });

router.use(authService.protect);

router
.route('/')
.post(
  authService.protect,
  authService.allowedTo('Orphanage'),
  uploadChildImage,
  resizeImage,
  setOrphanageIdToBody 
  ,createChildValidator
  ,addChild)
.get( createFilterObj,getChildren);

router
.route('/:id')
.get(getChildValidator ,getChild)
.put(
  authService.protect,
  authService.allowedTo('Orphanage'),
  uploadChildImage,
  resizeImage,
  updateChildValidator 
  ,updateChild)

.delete(
  authService.protect,
  authService.allowedTo('Orphanage'),    
    deleteChildValidator
    ,deleteChild);
module.exports = router;
