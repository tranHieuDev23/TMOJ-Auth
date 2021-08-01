import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { ErrorMessage } from "../../models/error-message";
import { JWT_COOKIE_NAME, validateJwt } from "../jwt/jwt-utils";

export const jwtAuthenticateRouter = Router();

jwtAuthenticateRouter.use(
    asyncHandler(async (request, response, next) => {
        const jwt = request.cookies[JWT_COOKIE_NAME];
        if (!jwt) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json(new ErrorMessage("The action is not authorized."));
        }
        const user = await validateJwt(jwt);
        if (!user) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json(new ErrorMessage("The action is not authorized."));
        }
        response.locals.user = user;
        next();
    })
);
