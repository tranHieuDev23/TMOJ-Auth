import { Router } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { ErrorMessage } from "../../models/error-message";
import { validateJwt } from "../jwt/jwt-utils";

export const internalRouter = Router();

internalRouter.post(
    "/auth/validate-token",
    asyncHandler(async (request, response) => {
        const jwt = request.body.jwt;
        const user = await validateJwt(jwt);
        if (!user) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json(new ErrorMessage("Invalid JWT."));
        }
        return response.status(StatusCodes.OK).json(user);
    })
);
