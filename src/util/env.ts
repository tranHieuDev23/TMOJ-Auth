import * as dotenv from "dotenv";
dotenv.config();

export const env = {
    AUTH_HOST: process.env.AUTH_HOST,
    AUTH_PORT: process.env.AUTH_PORT,
    DB_SERVICE_HOST: process.env.DB_SERVICE_HOST,
    DB_SERVICE_PORT: process.env.DB_SERVICE_PORT,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
};
