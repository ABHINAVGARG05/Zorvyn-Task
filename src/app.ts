import express, { type Express } from "express";
import { Request, Response } from "express";

import { sendSuccess, sendError } from "./utils/response";
import { MESSAGES } from "./constants/messages";
import pool from "./config/db";
import logger from "./utils/logger";

import authRouter from './modules/auth/auth.routes'
import userRouter from './modules/users/user.routes'

const app: Express = express();

app.use(express.json());

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

app.use('/auth', authRouter)
app.use('/users', userRouter)


export default app;
