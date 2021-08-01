import { Router } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../../models/user";
import {
    blacklistJwt,
    generateJwt,
    getCookeOptions,
    JWT_COOKIE_NAME,
    JWT_EXPIRES_IN,
} from "../jwt/jwt-utils";
import { jwtAuthenticateRouter } from "./jwt-authenticate";

export const internalRouter = Router();

internalRouter.post(
    "/auth/validate-token",
    jwtAuthenticateRouter,
    asyncHandler(async (request, response) => {
        const jwt = request.cookies[JWT_COOKIE_NAME];
        const user = response.locals.user as User;
        await blacklistJwt(jwt);
        const newJwt = await generateJwt(user.username, JWT_EXPIRES_IN);
        return response
            .cookie(JWT_COOKIE_NAME, newJwt, getCookeOptions())
            .json(user);
    })
);
