import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware.js'
import { z } from 'zod'

const router = Router()

const WorkflowCreateSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableTriggerId: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
  nodes: z.any().optional(),
  edges: z.any().optional(),
})

const WorkflowUpdateSchema = z.object({
  title: z.string().optional(),
  availableTriggerId: z.string().optional(),
  triggerMetadata: z.any().optional(),
  actions: z
    .array(
      z.object({
        availableActionId: z.string(),
        actionMetadata: z.any().optional(),
      })
    )
    .optional(),
  nodes: z.any().optional(),
  edges: z.any().optional(),
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: req.userId },
      include: {
        trigger: {
          include: {
            type: true,
          },
        },
        actions: {
          include: {
            type: true,
          },
          orderBy: {
            sortingOrder: 'asc',
          },
        },
      },
    })

    res.json({ workflows })
  } catch (e) {
    console.error('Error fetching workflows:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        trigger: {
          include: {
            type: true,
          },
        },
        actions: {
          include: {
            type: true,
          },
          orderBy: {
            sortingOrder: 'asc',
          },
        },
      },
    })

    if (!workflow) {
      res.status(404).json({ message: 'Workflow not found' })
      return
    }

    res.json({ workflow })
  } catch (e) {
    console.error('Error fetching workflow:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  const parsedData = WorkflowCreateSchema.safeParse(req.body)

  if (!parsedData.success) {
    res.status(400).json({ message: 'Invalid input' })
    return
  }

  try {
    const workflow = await prisma.workflow.create({
      data: {
        id: parsedData.data.id,
        userId: req.userId!,
        title: parsedData.data.title,
        nodes: parsedData.data.nodes || [],
        edges: parsedData.data.edges || [],
        trigger: {
          create: {
            availableTriggerId: parsedData.data.availableTriggerId,
            metadata: parsedData.data.triggerMetadata || {},
          },
        },
        actions: {
          create: parsedData.data.actions.map((action, index) => ({
            availableActionId: action.availableActionId,
            sortingOrder: index,
            metadata: action.actionMetadata || {},
          })),
        },
      },
    })

    res.json({ message: 'Workflow created', workflowId: workflow.id })
  } catch (e) {
    console.error('Error creating workflow:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  const parsedData = WorkflowUpdateSchema.safeParse(req.body)

  if (!parsedData.success) {
    res.status(400).json({ message: 'Invalid input' })
    return
  }

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    })

    if (!workflow) {
      res.status(404).json({ message: 'Workflow not found' })
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.workflow.update({
        where: { id: req.params.id },
        data: {
          title: parsedData.data.title || workflow.title,
          nodes: parsedData.data.nodes !== undefined ? parsedData.data.nodes : workflow.nodes,
          edges: parsedData.data.edges !== undefined ? parsedData.data.edges : workflow.edges,
        },
      })

      if (parsedData.data.availableTriggerId) {
        await tx.trigger.deleteMany({ where: { workflowId: req.params.id } })
        await tx.trigger.create({
          data: {
            workflowId: req.params.id,
            availableTriggerId: parsedData.data.availableTriggerId,
            metadata: parsedData.data.triggerMetadata || {},
          },
        })
      }

      if (parsedData.data.actions) {
        await tx.action.deleteMany({ where: { workflowId: req.params.id } })
        await Promise.all(
          parsedData.data.actions.map((action, index) =>
            tx.action.create({
              data: {
                workflowId: req.params.id,
                availableActionId: action.availableActionId,
                sortingOrder: index,
                metadata: action.actionMetadata || {},
              },
            })
          )
        )
      }
    })

    res.json({ message: 'Workflow updated' })
  } catch (e) {
    console.error('Error updating workflow:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    })

    if (!workflow) {
      res.status(404).json({ message: 'Workflow not found' })
      return
    }

    await prisma.workflow.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Workflow deleted' })
  } catch (e) {
    console.error('Error deleting workflow:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/status/history', authMiddleware, async (req, res) => {
  try {
    const runs = await prisma.workflowRun.findMany({
      where: {
        workflow: {
          userId: req.userId,
        },
      },
      include: {
        workflow: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    res.json({ runs })
  } catch (e) {
    console.error('Error fetching workflow runs:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

export { router as workflowRouter }

