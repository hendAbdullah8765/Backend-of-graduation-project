const express = require("express");
const authService = require("../services/authService");
const {
  getDonationItems,
  getDonationItem,
  createDonationItem,
  updateDonationItem,
  deleteDonationItem,
} = require("../services/DonationItemService");
const {
  createDonationItemValidator,
  getDonationItemValidator,
  updateDonationItemValidator,
  deleteDonationItemValidator,
} = require("../utils/validators/donationItemValidator");

const router = express.Router();

router.use(authService.protect);

router
  .route("/")
  .get(getDonationItems)
  .post(createDonationItemValidator, createDonationItem);

router
  .route("/:id")
  .get(getDonationItemValidator, getDonationItem)
  .put(updateDonationItemValidator, updateDonationItem)
  .delete(deleteDonationItemValidator, deleteDonationItem);

module.exports = router;
