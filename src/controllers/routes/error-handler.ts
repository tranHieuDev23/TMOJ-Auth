import { Request, Response, RequestHandler, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorMessage } from "../../models/error-message";
import { DatabaseApiError } from "../proxies/database-proxy";

export const errorHandlerRouter = Router();

errorHandlerRouter.use(
    (
        error: any,
        request: Request,
        response: Response,
        next: RequestHandler
    ) => {
        if (error instanceof DatabaseApiError) {
            return response
                .status(error.status)
                .json(new ErrorMessage(error.message));
        }
        console.error(error);
        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(new ErrorMessage("Internal server error."));
    }
);
