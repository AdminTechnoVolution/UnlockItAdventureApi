const mongoose = require('mongoose');
const PurchaseStatus = require('../../shared/constants/enums/EnumPurchaseStatus');
const PurchasePlatform = require('../../shared/constants/enums/EnumPurchasePlatform');

const purchaseSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        groupProgressId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupProgress', required: true },
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
        platform: { type: String, enum: Object.values(PurchasePlatform), required: true, lowercase: true },
        packageName: { type: String, required: true, trim: true },
        productId: { type: String, required: true, trim: true },
        purchaseToken: { type: String, required: true, trim: true },
        orderId: { type: String, required: true, trim: true },
        purchaseState: { type: Number, required: true },
        consumptionState: { type: Number, required: true },
        purchaseTimeMillis: { type: Number, required: true },
        regionCode: { type: String, trim: true },
        quantity: { type: Number, default: 1 },
        status: { type: String, enum: Object.values(PurchaseStatus), required: true, lowercase: true },
        priceAmountMicros: { type: Number },
        priceCurrencyCode: { type: String, trim: true, uppercase: true },
        refundedAt: { type: Date },
        lastRtdnNotificationType: { type: Number },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

purchaseSchema.index({ purchaseToken: 1 }, { unique: true });
purchaseSchema.index({ orderId: 1 }, { unique: true });
purchaseSchema.index({ groupProgressId: 1 });
purchaseSchema.index({ groupId: 1 });
purchaseSchema.index({ userId: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ groupId: 1, status: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema, 'purchases');
