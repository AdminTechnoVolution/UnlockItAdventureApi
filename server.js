require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const logger = require('./shared/config/logger');
const filename = path.basename(__filename);
const helmet = require('helmet');
const mongoose = require('./shared/config/mongo');
const redisClient = require('./shared/config/redis');
const errorHandler = require('./shared/middlewares/errorHandler');
const setHeaders = require('./shared/middlewares/setHeaders');
const logHeaders = require('./shared/middlewares/logHeaders');
const logRequest = require('./shared/middlewares/logRequest');
const logResponse = require('./shared/middlewares/logResponse');
const { createGlobalRateLimiter, createAuthRateLimiter } = require('./shared/middlewares/rateLimit');
const { swaggerUi, swaggerSpec } = require('./shared/config/swagger');
const env = require('./shared/constants/environmentSystemVariables');

const groupRoutes = require('./src/routes/group.route');
const groupProgressRoutes = require('./src/routes/groupProgress.route');
const healthRoutes = require('./src/routes/health.route');
const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/user.route');
const appConfigRoutes = require('./src/routes/appConfig.route');

const app = express();

app.set("trust proxy", true);
app.use(setHeaders);
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: env.BODY_JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_JSON_LIMIT }));
app.use(logRequest);
app.use(logHeaders);
app.use(logResponse);

const server = http.createServer(app);

if (env.ENABLE_SWAGGER === 'true') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    logger.info('Swagger documentation enabled', { className: filename });
}

const registerApiRoutes = () => {
    app.use('/api/', createGlobalRateLimiter());
    app.use('/api/', healthRoutes);
    app.use('/api/', groupRoutes);
    app.use('/api/', groupProgressRoutes);
    app.use('/api/auth/', createAuthRateLimiter());
    app.use('/api/auth/', authRoutes);
    app.use('/api/', userRoutes);
    app.use('/api/', appConfigRoutes);
    app.use(errorHandler);
};

const PORT = env.PORT;

const startServer = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        logger.error(`Redis connection failed: ${err.message}`, { className: filename });
        process.exit(1);
    }

    registerApiRoutes();

    mongoose.connectWithRetry();

    server.listen(PORT, () => {
        logger.info(`UnlockIt Adventure Backend App server running on port ${PORT}`, { className: filename });
    });
};

startServer().catch((err) => {
    logger.error(`Failed to start server: ${err.message}`, { className: filename });
    process.exit(1);
});
