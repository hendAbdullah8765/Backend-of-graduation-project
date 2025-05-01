const express = require("express");
const authService = require("../services/authService");
const {
  getDonations,
  getDonation,
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

router.use(authService.protect);

router
  .route("/")
  .get(getDonations)
  .post(createDonationValidator, createDonation);

router
  .route("/:id")
  .get(getDonationValidator, getDonation)
  .put(updateDonationValidator, updateDonation)
  .delete(deleteDonationValidator, deleteDonation);

module.exports = router;
