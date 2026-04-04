import express, { type Express } from "express";
import { Request, Response } from "express";
import cors from "cors";
import { getOpenApiDocument } from "./openapi";

import { sendSuccess, sendError } from "./utils/response";
import { MESSAGES } from "./constants/messages";
import pool from "./config/db";
import { env } from "./constants/constant";
import logger from "./utils/logger";
import { rateLimiter } from "./middlewares/rateLimiter";

import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/users/user.routes";
import recordRouter from "./modules/records/record.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";

const app: Express = express();

const allowedOrigins = (env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(rateLimiter);

app.get("/health", (req: Request, res: Response) => {
  sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS });
});

app.get("/db-health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    sendSuccess(res, {
      statusCode: 200,
      message: MESSAGES.COMMON.SUCCESS,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Database health check failed, ${error}`);
    sendError(res, {
      message: MESSAGES.COMMON.INTERNAL_ERROR,
      statusCode: 503,
      code: "DB_UNAVAILABLE",
      details: error instanceof Error ? error.message : error,
    });
  }
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/records", recordRouter);
app.use("/dashboard", dashboardRouter);

app.get("/api/spec.json", (req: Request, res: Response) => {
  try {
    const spec = getOpenApiDocument();
    res.json(spec);
  } catch (error) {
    logger.error(`Failed to generate OpenAPI spec: ${error}`);
    sendError(res, {
      message: MESSAGES.COMMON.INTERNAL_ERROR,
      statusCode: 500,
      code: "SPEC_NOT_FOUND",
    });
  }
});

if (process.env.NODE_ENV !== "test") {
  const { apiReference } = require("@scalar/express-api-reference");
  app.use(
    "/api/docs",
    apiReference({
      url: "/api/spec.json",
    } as any),
  );
}

export default app;
