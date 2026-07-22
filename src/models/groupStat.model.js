const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  key: { type: String, required: true },
  stats: { type: Map, of: Number }
}, { _id: false });

const groupStatSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    stats: { type: Map, of: Number },
    activities: { type: [ActivitySchema] }
  }, {
  timestamps: true,
  versionKey: false
});

groupStatSchema.index({ groupId: 1 });

module.exports = mongoose.model('GroupStat', groupStatSchema, 'groupStats');