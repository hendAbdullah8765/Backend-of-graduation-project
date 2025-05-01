// models/Follow.js
const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  OrphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

followSchema.index({ userId: 1, pageId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
