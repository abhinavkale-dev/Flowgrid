import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { workflowQueue } from '@repo/shared'

const router = Router()

router.all('/catch/:userId/:workflowId', async (req, res) => {

  const { userId, workflowId } = req.params
  const body = req.body

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    })

    if(!workflow) {
      return res.status(404).json({ message: 'Workflow not found' })
    }

    const run = await prisma.workflowRun.create({
      data: {
        workflowId: workflowId,
        metadata: body,
      },
    })

    await workflowQueue.add('process-workflow', {
      workflowRunId: run.id,
    }, {
      jobId: run.id,
    })

    res.json({message: 'Webhook received'})

  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export { router as hooksRouter }