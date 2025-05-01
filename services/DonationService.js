const factory = require("./handlerFactory");
const Donation = require("../models/DonationModel");

exports.getDonations = factory.getAll(Donation);
exports.getDonation = factory.getOne(Donation);
exports.createDonation = factory.createOne(Donation);
exports.updateDonation = factory.updateOne(Donation);
exports.deleteDonation = factory.deleteOne(Donation);
