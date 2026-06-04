const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const methodOrder = ["get", "post", "put", "delete", "patch"];
const path = require("path");

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UnlockIt Adventure API',
            version: '1.0.0',
            description: "API documentation for the UnlockIt Adventure App."
        },
        tags: [
            { name: "Health" },
            { name: "Auth" },
            { name: "Config" },
            { name: "Groups & Activities" },
            { name: "Group Progress" },
            { name: "Users" },
        ],
        components: {
            securitySchemes: {
                Bearer: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        }
    },
    apis: [
        path.join(__dirname, "../../src/docs/**/*.yml"),
        path.join(__dirname, "../../src/docs/**/*.yaml"),
    ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function sortSwaggerPaths(spec) {
    const methodGroups = {};

    Object.entries(spec.paths).forEach(([path, methods]) => {
        Object.keys(methods).forEach(method => {
            if (!methodGroups[method]) methodGroups[method] = {};
            methodGroups[method][path] = methods[method];
        });
    });

    const sortedPaths = {};

    methodOrder.forEach(method => {
        if (methodGroups[method]) {
            const sortedRoutes = Object.keys(methodGroups[method]).sort((a, b) => a.localeCompare(b));

            sortedRoutes.forEach(path => {
                if (!sortedPaths[path]) sortedPaths[path] = {};
                sortedPaths[path][method] = methodGroups[method][path];
            });
        }
    });

    spec.paths = sortedPaths;
}

sortSwaggerPaths(swaggerSpec);

module.exports = {
    swaggerUi,
    swaggerSpec,
};
