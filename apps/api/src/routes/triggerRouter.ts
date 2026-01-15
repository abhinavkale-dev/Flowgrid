import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/available', async (req, res) => {
  try {
    const triggers = await prisma.availableTrigger.findMany()

    res.json({ triggers })
  } catch (e) {
    console.error('Error fetching triggers:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

export { router as triggerRouter }

