import { Request, Response, RequestHandler } from "express";
import { BadRequest } from "express-openapi-validator/dist/openapi.validator";
import { StatusCodes } from "http-status-codes";
import { ErrorMessage } from "../../models/error-message";
import { DatabaseApiError } from "../proxies/database-proxy";

export function errorHandler(
    error: any,
    request: Request,
    response: Response,
    next: RequestHandler
) {
    if (error instanceof DatabaseApiError) {
        return response
            .status(error.status)
            .json(new ErrorMessage(error.message));
    }
    if (error instanceof BadRequest) {
        return response
            .status(error.status)
            .json(new ErrorMessage(error.message));
    }
    console.error(error);
    return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new ErrorMessage("Internal server error."));
}
