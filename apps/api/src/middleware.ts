import type { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No authorization token provided' })
      return
    }

    const token = authHeader.substring(7) 

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string
    }

    req.userId = decoded.userId

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
