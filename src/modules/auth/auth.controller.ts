import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshAuthToken,
  revokeRefreshToken,
} from "./auth.service";
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

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const data = await refreshAuthToken(refreshToken);
    sendSuccess(res, { message: MESSAGES.AUTH.LOGIN_SUCCESS, data });
  } catch (error) {
    if (error instanceof Error && error.message === "REFRESH_REVOKED") {
      return sendError(res, {
        message: "Refresh token revoked",
        statusCode: 401,
        code: "REFRESH_REVOKED",
      });
    }
    if (error instanceof Error && error.message === "REFRESH_EXPIRED") {
      return sendError(res, {
        message: "Refresh token expired",
        statusCode: 401,
        code: "REFRESH_EXPIRED",
      });
    }
    if (error instanceof Error && error.message === "REFRESH_INVALID") {
      return sendError(res, {
        message: "Refresh token invalid",
        statusCode: 401,
        code: "REFRESH_INVALID",
      });
    }
    logger.error(error);
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS });
  } catch (error) {
    if (error instanceof Error && error.message === "REFRESH_INVALID") {
      return sendError(res, {
        message: "Refresh token invalid",
        statusCode: 401,
        code: "REFRESH_INVALID",
      });
    }
    logger.error(error);
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
