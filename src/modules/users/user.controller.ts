import { Response } from "express";
import { AuthRequest } from "../../middlewares/authenticate";
import { getAllUsers, updateUserRole, updateUserStatus } from "./user.service";
import { sendSuccess, sendError } from "../../utils/response";
import { MESSAGES } from "../../constants/messages";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await getAllUsers(page, limit);
    sendSuccess(res, {
      message: MESSAGES.COMMON.SUCCESS,
      data: result.users,
      meta: result.pagination,
    });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const user = await updateUserRole(userId, req.body.role);
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return sendError(res, {
        message: MESSAGES.USER.NOT_FOUND,
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const user = await updateUserStatus(userId, req.body.status);
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return sendError(res, {
        message: MESSAGES.USER.NOT_FOUND,
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
