const factory = require("./handlerFactory");
const AdoptionRequest = require("../models/AdoptionRequestModel");

exports.getAdoptionRequests = factory.getAll(AdoptionRequest);
exports.getAdoptionRequest = factory.getOne(AdoptionRequest);
exports.createAdoptionRequest = factory.createOne(AdoptionRequest);
exports.updateAdoptionRequest = factory.updateOne(AdoptionRequest);
exports.deleteAdoptionRequest = factory.deleteOne(AdoptionRequest);
