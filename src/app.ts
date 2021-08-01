import express from "express";
import compression from "compression"; // compresses requests
import cookieParser from "cookie-parser";
import { apiValidatorMiddleware } from "./controllers/routes/openapi-validator";
import { authRouter } from "./controllers/routes/auth";
import { userManagementRouter } from "./controllers/routes/users";
import { internalRouter } from "./controllers/routes/internal";
import { env } from "./util/env";
import { errorHandlerRouter } from "./controllers/routes/error-handler";

// Create Express server
const app = express();

// Express configuration
app.set("port", env.AUTH_PORT || process.env.PORT);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(apiValidatorMiddleware);

// The APIs
app.use("/api/auth", authRouter);
app.use("/api/users", userManagementRouter);
app.use("/api/internal", internalRouter);

// Error handler
app.use(errorHandlerRouter);

export default app;
