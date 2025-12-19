const mongoose = require('mongoose');
const GroupProgressStatus = require('../../shared/constants/enums/EnumGroupProgressStatus');

const ActivitySchema = new mongoose.Schema({
  key: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: { type: Date, default: new Date() },
  notes: { type: String },
  photos: [{ url: String }],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { _id: false });

const groupProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    status: { type: String, enum: Object.values(GroupProgressStatus), default: GroupProgressStatus.IN_PROGRESS, required: true, lowercase: true },
    completedAt: { type: Date },
    activities: { type: [ActivitySchema] }
  }, {
  timestamps: true,
  versionKey: false
});

groupProgressSchema.index({ userId: 1 });
groupProgressSchema.index({ partnerId: 1 });
groupProgressSchema.index({ groupId: 1 });
groupProgressSchema.index({ status: 1 });

module.exports = mongoose.model('GroupProgress', groupProgressSchema, 'groupProgress');