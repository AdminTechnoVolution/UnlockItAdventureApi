const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String, trim: true },
}, {
    timestamps: true,
    versionKey: false,
});

appConfigSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('AppConfig', appConfigSchema, 'appConfigs');
