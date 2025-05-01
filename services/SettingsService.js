const factory = require("./handlerFactory");
const Settings = require("../models/SettingsModel");

exports.getSettings = factory.getAll(Settings);
exports.getSettingsById = factory.getOne(Settings);
exports.createSettings = factory.createOne(Settings);
exports.updateSettings = factory.updateOne(Settings);
exports.deleteSettings = factory.deleteOne(Settings);
