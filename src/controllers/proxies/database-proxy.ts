import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { env } from "../../util/env";
import { User } from "../../models/user";
import { BlacklistedJwt } from "../../models/blacklisted-jwt";
import {
    AuthenticationMethod,
    AuthenticationDetail,
} from "../../models/authentication-detail";

const axiosInstance = axios.create({
    baseURL: `http://${env.DB_SERVICE_HOST}:${env.DB_SERVICE_PORT}`,
    validateStatus: () => true,
});

export class DatabaseApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly message: string
    ) {
        super(
            `Error while calling Database Service: status=${status}, message=${message}`
        );
    }
}

export async function createUser(user: User): Promise<User> {
    const response = await axiosInstance.post("/api/users", user);
    const { status, data } = response;
    if (status === StatusCodes.BAD_REQUEST) {
        throw new DatabaseApiError(status, "Invalid user information.");
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return User.fromObject(data);
}

export async function getUser(username: string): Promise<User> {
    const response = await axiosInstance.get(`/api/users/${username}`);
    const { status, data } = response;
    if (status === StatusCodes.NOT_FOUND) {
        return null;
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return User.fromObject(data);
}

export async function updateUser(user: User): Promise<User> {
    const response = await axiosInstance.patch(
        `/api/users/${user.username}`,
        user
    );
    const { status, data } = response;
    if (status === StatusCodes.NOT_FOUND) {
        return null;
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return User.fromObject(data);
}

export async function createAuthenticationDetail(
    username: string,
    authenticationDetail: AuthenticationDetail
): Promise<void> {
    const response = await axiosInstance.post(
        `/api/auth/${username}`,
        authenticationDetail
    );
    const { status } = response;
    if (status === StatusCodes.BAD_REQUEST) {
        throw new DatabaseApiError(status, "Invalid user information.");
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
}

export async function getAuthenticationDetail(
    username: string,
    method: AuthenticationMethod
): Promise<AuthenticationDetail> {
    const response = await axiosInstance.get(
        `/api/auth/${username}/${method.valueOf()}`
    );
    const { status, data } = response;
    if (status === StatusCodes.NOT_FOUND) {
        return null;
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return AuthenticationDetail.fromObject(data);
}

export async function updateAuthenticationDetail(
    username: string,
    authenticationDetail: AuthenticationDetail
): Promise<void> {
    const response = await axiosInstance.patch(
        `/api/auth/${username}/${authenticationDetail.method.valueOf()}`,
        authenticationDetail
    );
    const { status } = response;
    if (status === StatusCodes.NOT_FOUND) {
        return null;
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
}

export async function createBlacklistedJwt(
    blacklistedJwt: BlacklistedJwt
): Promise<BlacklistedJwt> {
    const response = await axiosInstance.post(
        "/api/blacklisted-jwts",
        blacklistedJwt
    );
    const { status, data } = response;
    if (status === StatusCodes.BAD_REQUEST) {
        throw new DatabaseApiError(status, "Invalid user information.");
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return BlacklistedJwt.fromObject(data);
}

export async function getBlacklistedJwt(
    jwtId: string
): Promise<BlacklistedJwt> {
    const response = await axiosInstance.get(`/api/blacklisted-jwts/${jwtId}`);
    const { status, data } = response;
    if (status === StatusCodes.NOT_FOUND) {
        return null;
    }
    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
        throw new DatabaseApiError(status, "Internal server error.");
    }
    return BlacklistedJwt.fromObject(data);
}
