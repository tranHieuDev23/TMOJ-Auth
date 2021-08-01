import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
    getAuthenticationDetail,
    getUser,
    updateAuthenticationDetail,
    updateUser,
} from "../proxies/database-proxy";
import { User } from "../../models/user";
import { jwtAuthenticateRouter } from "./jwt-authenticate";
import { ErrorMessage } from "../../models/error-message";
import {
    AuthenticationDetail,
    AuthenticationMethod,
} from "../../models/authentication-detail";
import { isPasswordEqual } from "../../util/encryption";

export const userManagementRouter = Router();

userManagementRouter.post(
    "/validate-username-available",
    asyncHandler(async (request, response) => {
        const username = request.body.username;
        const user = await getUser(username);
        return response.json({ available: user === null });
    })
);

userManagementRouter.post(
    "/update-user",
    jwtAuthenticateRouter,
    asyncHandler(async (request, response) => {
        const user = response.locals.user as User;
        const requestedUser = User.fromObject(request.body);
        requestedUser.username = user.username;
        const updatedUser = await updateUser(requestedUser);
        return response.json(updatedUser);
    })
);

userManagementRouter.post(
    "/update-user-password",
    jwtAuthenticateRouter,
    asyncHandler(async (request, response) => {
        const user = response.locals.user as User;
        const { oldPassword, newPassword } = request.body;
        if (oldPassword === newPassword) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json(
                    new ErrorMessage(
                        "Updated password is equal to old password."
                    )
                );
        }
        const passwordDetail = await getAuthenticationDetail(
            user.username,
            AuthenticationMethod.Password
        );
        if (passwordDetail) {
            if (!isPasswordEqual(oldPassword, passwordDetail.value)) {
                return response
                    .status(StatusCodes.UNAUTHORIZED)
                    .json(new ErrorMessage("Old password is not correct."));
            }
        }
        await updateAuthenticationDetail(
            user.username,
            new AuthenticationDetail(AuthenticationMethod.Password, newPassword)
        );
        return response.sendStatus(StatusCodes.OK);
    })
);
