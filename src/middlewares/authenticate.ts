import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../constants/constant";
import { sendError } from "../utils/response";
import { MESSAGES } from "../constants/messages";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, {
      message: MESSAGES.AUTH.TOKEN_MISSING,
      statusCode: 401,
      code: "TOKEN_MISSING",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    sendError(res, {
      message: MESSAGES.AUTH.TOKEN_INVALID,
      statusCode: 401,
      code: "TOKEN_INVALID",
    });
  }
};
