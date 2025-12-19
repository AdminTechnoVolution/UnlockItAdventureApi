const mongoose = require('mongoose');
const { Schema } = mongoose;

const fcmTokensSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fcmTokens: { type: [String] }
}, {
  versionKey: false
});

fcmTokensSchema.index({ "userId": 1 }, { unique: true });
fcmTokensSchema.index({ "userId": 1, "fcmTokens": 1 });

module.exports = mongoose.model('FCMTokens', fcmTokensSchema, 'fcmTokens');