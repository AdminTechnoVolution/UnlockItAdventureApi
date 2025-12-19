const mongoose = require("mongoose");
const packageJson = require("../../package.json");
const redisClient = require('../../shared/config/redis');
const { transporter } = require("../../shared/config/email");
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const env = require('../../shared/constants/environmentSystemVariables');

const getHealth = async () => {
    const healthInfo = {
        status: "ok",
        name: packageJson.name,
        version: packageJson.version,
        environment: env.NODE_ENV || "development",
        uptime: formatUptime(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {}
    };

    await mongoStatus(healthInfo);
    await redisStatus(healthInfo);
    await mailerStatus(healthInfo);

    return new BaseResponse(healthInfo.status === "ok", [], healthInfo);
}

const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
    parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);

    return parts.join(', ');
}

const mongoStatus = async (healthInfo) => {
    try {
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        const mongoState = mongoose.connection.readyState;

        healthInfo.services.mongo = {
            status: states[mongoState],
            uri: process.env.MONGO_URI ? "configured" : "missing"
        };

        if (mongoState !== 1) {
            healthInfo.status = "degraded";
        }
    } catch (err) {
        healthInfo.services.mongo = {
            status: "error",
            error: err.message
        };
        healthInfo.status = "error";
    }
}

const redisStatus = async (healthInfo) => {
    try {
        const pong = await redisClient.ping();

        healthInfo.services.redis = {
            status: pong === "PONG" ? "connected" : "error",
            uri: process.env.REDIS_URI ? "configured" : "missing"
        };

        if (pong !== "PONG") {
            healthInfo.status = "degraded";
        }
    } catch (err) {
        healthInfo.services.redis = {
            status: "error",
            error: err.message
        };
        healthInfo.status = "error";
    }
}

const mailerStatus = async (healthInfo) => {
    try {
        await transporter.verify();

        healthInfo.services.mailer = {
            status: "connected",
            service: transporter.options.service || null,
            user: transporter.options.auth.user
        };
    } catch (err) {
        healthInfo.services.mailer = {
            status: "error",
            error: err.message
        };
        healthInfo.status = "degraded";
    }
}

module.exports = { getHealth };