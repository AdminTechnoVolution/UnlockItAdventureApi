const fs = require('fs');
const path = require('path');

const models = {};

const modelsPath = __dirname;

fs.readdirSync(modelsPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .forEach(file => {
        const model = require(path.join(modelsPath, file));
        models[model.modelName] = model;
    });

module.exports = models;