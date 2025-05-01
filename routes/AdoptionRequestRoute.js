const express = require("express");
const authService = require("../services/authService");
const {
  getAdoptionRequests,
  getAdoptionRequest,
  createAdoptionRequest,
  updateAdoptionRequest,
  deleteAdoptionRequest,
} = require("../services/AdoptionRequestService");
const {
  createAdoptionRequestValidator,
  getAdoptionRequestValidator,
  updateAdoptionRequestValidator,
  deleteAdoptionRequestValidator,
} = require("../utils/validators/adoptionRequestValidator");

const router = express.Router();

router.use(authService.protect);

router
  .route("/")
  .get(getAdoptionRequests)
  .post(createAdoptionRequestValidator, createAdoptionRequest);

router
  .route("/:id")
  .get(getAdoptionRequestValidator, getAdoptionRequest)
  .put(updateAdoptionRequestValidator, updateAdoptionRequest)
  .delete(deleteAdoptionRequestValidator, deleteAdoptionRequest);

module.exports = router;
