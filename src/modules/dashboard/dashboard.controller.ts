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
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await getSummary({ from, to });
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const byCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await getByCategory({ from, to });
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const trends = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, period } = req.query as {
      from?: string;
      to?: string;
      period?: string;
    };
    const data = await getTrends({ from, to, period });
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const recent = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, limit } = req.query as {
      from?: string;
      to?: string;
      limit?: string;
    };
    const data = await getRecent({
      from,
      to,
      limit: limit ? Number(limit) : undefined,
    });
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
