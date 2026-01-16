import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: session.user.id },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, nodes, edges } = body

    const workflow = await prisma.workflow.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        title: title || 'Untitled Workflow',
        nodes: nodes || [],
        edges: edges || [],
      },
    })

    return NextResponse.json({
      id: workflow.id,
      title: workflow.title,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}
