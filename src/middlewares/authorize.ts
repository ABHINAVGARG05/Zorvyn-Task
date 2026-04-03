import { Response, NextFunction } from 'express'
import { AuthRequest } from './authenticate'
import { sendError } from '../utils/response'
import { MESSAGES } from '../constants/messages'

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        message: MESSAGES.AUTH.UNAUTHORIZED,
        statusCode: 403,
        code: 'FORBIDDEN',
      })
    }
    next()
  }
}