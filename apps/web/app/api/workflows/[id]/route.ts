import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const workflow = await prisma.workflow.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        actions: {
          include: {
            type: true,
          },
          orderBy: {
            sortingOrder: 'asc',
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: workflow.id,
      title: workflow.title,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.workflow.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        title: body.title,
        nodes: body.nodes || [],
        edges: body.edges || [],
      },
    })

    return NextResponse.json({
      id: workflow.id,
      title: workflow.title,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.workflow.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    await prisma.workflow.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}
