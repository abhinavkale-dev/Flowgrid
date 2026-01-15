import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

const CredentialCreateSchema = z.object({
  title: z.string(),
  platform: z.enum(['email', 'telegram', 'slack', 'openai']),
  keys: z.any(),
})

const CredentialUpdateSchema = z.object({
  title: z.string().optional(),
  keys: z.any().optional(),
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const credentials = await prisma.credentials.findMany({
      where: { userId: res.locals.userId },
    })

    res.json({ credentials })
  } catch (e) {
    console.error('Error fetching credentials:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const parsedData = CredentialCreateSchema.safeParse(req.body)

  if (!parsedData.success) {
    res.status(400).json({ message: 'Invalid input' })
    return
  }

  try {
    const credential = await prisma.credentials.create({
      data: {
        title: parsedData.data.title,
        platform: parsedData.data.platform,
        keys: parsedData.data.keys,
        userId: res.locals.userId,
      },
    })

    res.json({
      message: 'Credentials created',
      credentialId: credential.id,
    })
  } catch (e) {
    console.error('Error creating credentials:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const parsedData = CredentialUpdateSchema.safeParse(req.body)

  if (!parsedData.success) {
    res.status(400).json({ message: 'Invalid input' })
    return
  }

  try {
    const credential = await prisma.credentials.findFirst({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
    })

    if (!credential) {
      res.status(404).json({ message: 'Credential not found' })
      return
    }

    await prisma.credentials.update({
      where: { id: req.params.id },
      data: {
        title: parsedData.data.title,
        keys: parsedData.data.keys,
      },
    })

    res.json({ message: 'Credentials updated' })
  } catch (e) {
    console.error('Error updating credentials:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const credential = await prisma.credentials.findFirst({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
    })

    if (!credential) {
      res.status(404).json({ message: 'Credential not found' })
      return
    }

    await prisma.credentials.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Credentials deleted' })
  } catch (e) {
    console.error('Error deleting credentials:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

export { router as credentialsRouter }

