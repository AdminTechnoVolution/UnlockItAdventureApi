const path = require('path');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const env = require('../constants/environmentSystemVariables');
const redis = require('redis');
let reconnectAttempt = 0;

const redisClient = redis.createClient({
    url: env.REDIS_URI,
    socket: {
        reconnectStrategy: (attempt) => {
            return Math.min(attempt * 1000, 5000);
        }
    }
});

redisClient.connect();

redisClient.on('ready', () => {
    reconnectAttempt = 0;
    logger.info('Redis connected', { className: filename });
});

redisClient.on('error', (err) => {
    logger.error('Redis failed connection. Error:' + err, { className: filename });
});

redisClient.on('end', () => {
    logger.info('Redis connection closed', { className: filename });
});

redisClient.on('close', () => {
    logger.info('Redis connection closed', { className: filename });
});

redisClient.on('reconnecting', () => {
    reconnectAttempt++;
    logger.info(`Attempting to reconnect to Redis, attempt #${reconnectAttempt}`, { className: filename });
});

module.exports = redisClient;