import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/response";
import { MESSAGES } from "../constants/messages";

const formatZodError = (error: unknown) => {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as {
      issues: Array<{ path: (string | number)[]; message: string }>;
    }).issues;
    return issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  return [];
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, {
        message: MESSAGES.COMMON.BAD_REQUEST,
        statusCode: 400,
        code: "VALIDATION_ERROR",
        details: formatZodError(result.error),
      });
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return sendError(res, {
        message: MESSAGES.COMMON.BAD_REQUEST,
        statusCode: 400,
        code: "VALIDATION_ERROR",
        details: formatZodError(result.error),
      });
    }
    req.query = result.data as typeof req.query;
    next();
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return sendError(res, {
        message: MESSAGES.COMMON.BAD_REQUEST,
        statusCode: 400,
        code: "VALIDATION_ERROR",
        details: formatZodError(result.error),
      });
    }
    req.params = result.data as typeof req.params;
    next();
  };
};
