import { Response } from 'express'

type SuccessResponse<T = unknown> = {
  success: true
  message: string
  data: T | null
  meta?: Record<string, unknown>
}

type ErrorResponse = {
  success: false
  message: string
  error: {
    code: string
    details?: unknown
  }
}

export const sendSuccess = <T>(
  res: Response,
  options: {
    message: string
    data?: T
    statusCode?: number
    meta?: Record<string, unknown>
  }
) => {
  const { message, data = null, statusCode = 200, meta } = options

  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta !== undefined && { meta }),
  }

  return res.status(statusCode).json(response)
}

export const sendError = (
  res: Response,
  options: {
    message: string
    statusCode?: number
    code?: string
    details?: unknown
  }
) => {
  const {
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details,
  } = options

  const response: ErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
  }

  return res.status(statusCode).json(response)
}