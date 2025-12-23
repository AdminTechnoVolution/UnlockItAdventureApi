const mongoose = require('mongoose');

const AdditionalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const ActivitySchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  tips: { type: Map, of: [String] },
  imageUrl: { type: String },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  additionalInfo: { type: Map, of: [AdditionalInfoSchema] },
  tags: { type: Map, of: [String] },
  difficulty: { type: Number, min: 1, max: 5, default: 1 }
}, { _id: false });

const groupSchema = new mongoose.Schema(
  {
    name: { type: Map, of: String, required: true },
    description: { type: Map, of: String },
    imageUrl: { type: String },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
    additionalInfo: { type: Map, of: [AdditionalInfoSchema] },
    productsId: { type: [String] },
    tags: { type: Map, of: [String] },
    isActive: { type: Boolean, default: true },
    activities: { type: [ActivitySchema] }
  }, {
  timestamps: true,
  versionKey: false
});

groupSchema.index({ isActive: 1 });

module.exports = mongoose.model('Group', groupSchema, 'groups');