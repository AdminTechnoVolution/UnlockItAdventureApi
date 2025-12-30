const mongoose = require('mongoose');
const { Schema } = mongoose;
const Platforms = require('../../shared/constants/enums/EnumPlatforms');

const DeviceSchema = new mongoose.Schema({
  fcmToken: { type: String, required: true },
  platform: { type: String, enum: Object.values(Platforms), required: true, lowercase: true },
  appVersion: { type: String },
  deviceId: { type: String },
}, { _id: false });

const fcmTokensSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  devices: { type: [DeviceSchema] }
}, {
  versionKey: false
});

fcmTokensSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('FCMTokens', fcmTokensSchema, 'fcmTokens');