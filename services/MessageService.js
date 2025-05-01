const factory = require("./handlerFactory");
const Message = require("../models/MessageModel");

exports.getMessages = factory.getAll(Message);
exports.getMessage = factory.getOne(Message);
exports.createMessage = factory.createOne(Message);
exports.updateMessage = factory.updateOne(Message);
exports.deleteMessage = factory.deleteOne(Message);
