import { Response } from "express";
import { AuthRequest } from "../../middlewares/authenticate";
import {
  getSummary,
  getByCategory,
  getTrends,
  getRecent,
} from "./dashboard.service";
import { sendSuccess, sendError } from "../../utils/response";
import { MESSAGES } from "../../constants/messages";

export const summary = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getSummary();
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const byCategory = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getByCategory();
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const trends = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getTrends();
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const recent = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getRecent();
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
