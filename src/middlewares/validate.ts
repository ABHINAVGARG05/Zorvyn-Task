import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { sendError } from '../utils/response'
import { MESSAGES } from '../constants/messages'

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return sendError(res, {
      message: MESSAGES.COMMON.BAD_REQUEST,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    })
  }
  next()
}