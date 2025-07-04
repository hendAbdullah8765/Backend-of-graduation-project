const express = require("express");
const {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} = require("../services/DonationService");
const {
  createDonationValidator,
  getDonationValidator,
  updateDonationValidator,
  deleteDonationValidator,
} = require("../utils/validators/donationValidator");

const router = express.Router();
const authService = require("../services/authService");

router.use(authService.protect);

router
  .route("/")
  .get(getAllDonations)
  .post(createDonationValidator, createDonation);

router
  .route("/:id")
  .get(getDonationValidator, getDonationById)
  .put(updateDonationValidator, updateDonation)
  .delete(deleteDonationValidator, deleteDonation);

module.exports = router;
