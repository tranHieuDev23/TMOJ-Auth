import { middleware } from "express-openapi-validator";

export const apiValidatorMiddleware = middleware({
    apiSpec: "./api.json",
    validateResponses: {
        removeAdditional: "all",
    },
});
