import type { Request, Response, NextFunction } from 'express'

export async function requireAuth(
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

    const sessionToken = authHeader.substring(7)

    const betterAuthUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${betterAuthUrl}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    })

    if (!response.ok) {
      res.status(401).json({ message: 'Invalid or expired session' })
      return
    }

    const session = await response.json()

    if (!session || !session.user) {
      res.status(401).json({ message: 'Invalid session' })
      return
    }

    res.locals.userId = session.user.id

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ message: 'Authentication failed' })
  }
}
