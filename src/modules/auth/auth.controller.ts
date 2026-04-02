import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";
import { MESSAGES } from "../../constants/messages";
import logger from "../../utils/logger";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    sendSuccess(res, {
      message: MESSAGES.USER.CREATED,
      data: user,
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return sendError(res, {
        message: "Email already in use",
        statusCode: 409,
        code: "EMAIL_TAKEN",
      });
    }
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    sendSuccess(res, { message: MESSAGES.AUTH.LOGIN_SUCCESS, data });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return sendError(res, {
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });
    }
    if (error instanceof Error && error.message === "ACCOUNT_INACTIVE") {
      return sendError(res, {
        message: "Account is inactive",
        statusCode: 403,
        code: "ACCOUNT_INACTIVE",
      });
    }
    logger.error(error);
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
