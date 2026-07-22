const mongoose = require('mongoose');
const path = require('path');
const logger = require('./logger');
const filename = path.basename(__filename);
const env = require('../constants/environmentSystemVariables');
let reconnectAttempt = 0;
let isConnecting = false;

const connectWithRetry = () => {
    if (isConnecting) return;
    isConnecting = true;
    reconnectAttempt++;
    const delay = Math.min(reconnectAttempt * 1000, 5000);
    logger.info(`Attempting to reconnect to Mongo, attempt #${reconnectAttempt}`, { className: filename });

    setTimeout(() => {
        mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
            socketTimeoutMS: env.MONGO_SOCKET_TIMEOUT_MS,
            maxPoolSize: env.MONGO_MAX_POOL_SIZE,
            minPoolSize: env.MONGO_MIN_POOL_SIZE,
            connectTimeoutMS: env.MONGO_CONNECTION_TIMEOUT_MS,
            heartbeatFrequencyMS: env.MONGO_HEARTBEAT_FREQUENCY_MS,
            retryWrites: env.MONGO_RETRY_WRITES
        })
            .then(() => {
                isConnecting = false;
            })
            .catch(err => {
                isConnecting = false;
                logger.error('MongoDB attempting to reconnect. MongoDB connection error:', err, { className: filename });
                connectWithRetry();
            });
    }, delay);
};

mongoose.connection.on('connected', () => {
    reconnectAttempt = 0;
    logger.info('MongoDB connected', { className: filename });
});

mongoose.connection.on('close', () => {
    logger.info('MongoDB connection closed', { className: filename });
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`, { className: filename });
});

mongoose.connection.on('disconnected', () => {
    connectWithRetry();
});

mongoose.connectWithRetry = connectWithRetry;

module.exports = mongoose;
