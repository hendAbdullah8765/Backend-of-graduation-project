const factory = require("./handlerFactory");
const DonationItem = require("../models/DonationItemModel");

exports.getDonationItems = factory.getAll(DonationItem);
exports.getDonationItem = factory.getOne(DonationItem);
exports.createDonationItem = factory.createOne(DonationItem);
exports.updateDonationItem = factory.updateOne(DonationItem);
exports.deleteDonationItem = factory.deleteOne(DonationItem);
