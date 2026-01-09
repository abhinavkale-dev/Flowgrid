import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/available', async (req, res) => {
  try {
    const actions = await prisma.availableAction.findMany()

    res.json({ actions })
  } catch (e) {
    console.error('Error fetching actions:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

export { router as actionRouter }

