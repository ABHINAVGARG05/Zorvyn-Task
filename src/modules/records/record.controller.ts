import { Response } from "express";
import { AuthRequest } from "../../middlewares/authenticate";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "./record.service";
import { sendSuccess, sendError } from "../../utils/response";
import { MESSAGES } from "../../constants/messages";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const record = await createRecord(req.user!.id, req.body);
    sendSuccess(res, {
      message: MESSAGES.COMMON.SUCCESS,
      data: record,
      statusCode: 201,
    });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, from, to, page, limit } = req.query;
    const result = await getRecords({
      type: type as string,
      category: category as string,
      from: from as string,
      to: to as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendSuccess(res, {
      message: MESSAGES.COMMON.SUCCESS,
      data: result.records,
      meta: result.pagination,
    });
  } catch {
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string
    const record = await updateRecord(userId, req.body);
    sendSuccess(res, { message: MESSAGES.COMMON.SUCCESS, data: record });
  } catch (error) {
    if (error instanceof Error && error.message === "RECORD_NOT_FOUND") {
      return sendError(res, {
        message: "Record not found",
        statusCode: 404,
        code: "RECORD_NOT_FOUND",
      });
    }
    if (error instanceof Error && error.message === "NO_FIELDS") {
      return sendError(res, {
        message: "No fields to update",
        statusCode: 400,
        code: "NO_FIELDS",
      });
    }
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string
    await deleteRecord(userId);
    sendSuccess(res, { message: "Record deleted successfully", data: null });
  } catch (error) {
    if (error instanceof Error && error.message === "RECORD_NOT_FOUND") {
      return sendError(res, {
        message: "Record not found",
        statusCode: 404,
        code: "RECORD_NOT_FOUND",
      });
    }
    sendError(res, { message: MESSAGES.COMMON.INTERNAL_ERROR });
  }
};
