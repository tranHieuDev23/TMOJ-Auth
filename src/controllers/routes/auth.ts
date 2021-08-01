import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { isPasswordEqual } from "../../util/encryption";
import {
    AuthenticationDetail,
    AuthenticationMethod,
} from "../../models/authentication-detail";
import { User } from "../../models/user";
import { ErrorMessage } from "../../models/error-message";
import {
    blacklistJwt,
    generateJwt,
    getCookeOptions,
    JWT_COOKIE_NAME,
    JWT_EXPIRES_IN,
} from "../jwt/jwt-utils";
import {
    createAuthenticationDetail,
    createUser,
    getAuthenticationDetail,
    getUser,
} from "../proxies/database-proxy";
import { jwtAuthenticateRouter } from "./jwt-authenticate";

export const authRouter = Router();

async function authenticateUser(
    username: string,
    authenticationDetail: AuthenticationDetail
): Promise<boolean> {
    const { method, value } = authenticationDetail;
    const detailInDb = await getAuthenticationDetail(username, method);
    if (!detailInDb) {
        return false;
    }
    switch (method) {
        case AuthenticationMethod.Password:
            return isPasswordEqual(value, detailInDb.value);
    }
}

authRouter.post(
    "/register",
    asyncHandler(async (request, response) => {
        const newUser = User.fromObject(request.body.user);
        const newAuthenticationDetail = AuthenticationDetail.fromObject(
            request.body.authenticationDetail
        );
        const registeredUser = await createUser(newUser);
        await createAuthenticationDetail(
            registeredUser.username,
            newAuthenticationDetail
        );
        const jwt = await generateJwt(registeredUser.username, JWT_EXPIRES_IN);
        return response
            .cookie(JWT_COOKIE_NAME, jwt, getCookeOptions())
            .json(registeredUser);
    })
);

authRouter.post(
    "/login",
    asyncHandler(async (request, response) => {
        const username = request.body.username as string;
        const authenticationDetail = AuthenticationDetail.fromObject(
            request.body.authenticationDetail
        );
        const authenticated = await authenticateUser(
            username,
            authenticationDetail
        );
        if (!authenticated) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json(new ErrorMessage("Incorrect username or password."));
        }
        const user = await getUser(username);
        const jwt = await generateJwt(username, JWT_EXPIRES_IN);
        return response
            .cookie(JWT_COOKIE_NAME, jwt, getCookeOptions())
            .json(user);
    })
);

authRouter.post(
    "/logout",
    jwtAuthenticateRouter,
    asyncHandler(async (request, response) => {
        const jwt = request.cookies[JWT_COOKIE_NAME];
        await blacklistJwt(jwt);
        response.clearCookie(JWT_COOKIE_NAME).send();
    })
);

authRouter.post(
    "/refresh-token",
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
