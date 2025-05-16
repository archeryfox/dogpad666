// dogpad.backend/docs/swagger.js
import swagger_autogen from "swagger-autogen";

const options = {
    openapi: "OpenAPI 3",
    language: "ru-RU",
    disableLogs: false,
    autoHeaders: false,
    autoQuery: false,
    autoBody: false,
};
const generateSwagger = swagger_autogen();

const swaggerDocument = {
    info: {
        version: "1.0.0",
        title: "Timepad GodDAmnn Work",
        description: "API for Managing todo calls",
        contact: {
            name: "API Support",
            email: "tiwariankit496@gmail.com",
        },
    },
    host: "localhost:8081",
    basePath: "/",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
        {
            name: "TODO CRUD",
            description: "TODO related apis",
        },
        {
            name: "Todo",
            description: "Todo App",
        },
    ],
    securityDefinitions: {},
    definitions: {
        todoResponse: {
            code: 200,
            message: "Success",
        },
        "errorResponse.400": {
            code: 400,
            message:
                "The request was malformed or invalid. Please check the request parameters.",
        },
        "errorResponse.401": {
            code: 401,
            message: "Authentication failed or user lacks proper authorization.",
        },
        "errorResponse.403": {
            code: 403,
            message: "You do not have permission to access this resource.",
        },
        "errorResponse.404": {
            code: "404",
            message: "The requested resource could not be found on the server.",
        },
        "errorResponse.500": {
            code: 500,
            message:
                "An unexpected error occurred on the server. Please try again later.",
        },
    },
};
const swaggerFile= "./docs/swagger.json";
const apiRouteFile= ["../app.js"];
generateSwagger(swaggerFile, apiRouteFile, swaggerDocument);