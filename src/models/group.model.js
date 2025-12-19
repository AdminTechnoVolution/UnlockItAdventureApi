const mongoose = require('mongoose');
const Tiers = require('../../shared/constants/enums/EnumTiers');

const AdditionalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const PriceSchema = new mongoose.Schema({
  currency: { type: String, required: true, uppercase: true, trim: true },
  cost: { type: Number, required: true, min: 0 },
  tier: { type: String, enum: Object.values(Tiers), required: true, lowercase: true },
  features: { type: Map, of: [String] },
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
    prices: { type: [PriceSchema] },
    tags: { type: Map, of: [String] },
    isActive: { type: Boolean, default: true },
    activities: { type: [ActivitySchema] }
  }, {
  timestamps: true,
  versionKey: false
});

groupSchema.index({ isActive: 1 });

module.exports = mongoose.model('Group', groupSchema, 'groups');