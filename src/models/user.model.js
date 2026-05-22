const mongoose = require('mongoose');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');
const AuthType = require('../../shared/constants/enums/EnumAuthType');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  username: { type: String, required: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  profileImageUrl: { type: String },
  authType: { type: String, enum: Object.values(AuthType) },
  providerId: { type: String },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE, required: true, lowercase: true },
  lastLogin: { type: Date },
  verificationExpiresAt: { type: Date },
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ authType: 1, providerId: 1 }, { unique: true, sparse: true });
userSchema.index({ status: 1 });
userSchema.index({ verificationExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', userSchema, 'users');
