import { CookieOptions } from "express";
import { sign, verify } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { User } from "../../models/user";
import { BlacklistedJwt } from "../../models/blacklisted-jwt";
import { env } from "../../util/env";
import {
    getUser,
    createBlacklistedJwt,
    getBlacklistedJwt,
} from "../proxies/database-proxy";

const NANOID_LENGTH = 20;

export async function generateJwt(
    username: string,
    expiresIn: string = "30d"
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        sign(
            {},
            env.JWT_PRIVATE_KEY,
            {
                subject: username,
                expiresIn,
                jwtid: nanoid(NANOID_LENGTH),
                algorithm: "RS512",
            },
            (err, encoded) => {
                if (err) {
                    return reject(err);
                }
                return resolve(encoded);
            }
        );
    });
}

export async function validateJwt(jwt: string): Promise<User> {
    const now = new Date();
    return new Promise<User>((resolve) => {
        verify(
            jwt,
            env.JWT_PUBLIC_KEY,
            { algorithms: ["RS512"] },
            async (err, decoded) => {
                if (err) {
                    return resolve(null);
                }
                const jwtId = decoded.jti;
                const blacklistedJwt = await getBlacklistedJwt(jwtId);
                if (blacklistedJwt && blacklistedJwt.exp < now) {
                    return resolve(null);
                }
                const username = decoded.sub;
                resolve(getUser(username));
            }
        );
    });
}

export async function blacklistJwt(jwt: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        verify(jwt, env.JWT_PUBLIC_KEY, async (err, decoded) => {
            if (err) {
                return reject(err);
            }
            const jwtId = decoded.jti;
            const exp = new Date(decoded.exp);
            await createBlacklistedJwt(new BlacklistedJwt(jwtId, exp));
            resolve();
        });
    });
}

export const JWT_COOKIE_NAME = "tmoj-token";
export const JWT_EXPIRES_IN = "30d";
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function getCookeOptions(): CookieOptions {
    const options: CookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + THIRTY_DAYS),
    };
    return options;
}
