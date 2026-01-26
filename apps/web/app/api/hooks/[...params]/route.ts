import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { workflowQueue } from '@repo/shared'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const { params: routeParams } = await params
    const [userId, workflowId] = routeParams
    
    if (!userId || !workflowId) {
      return NextResponse.json(
        { message: 'Missing userId or workflowId' },
        { status: 400 }
      )
    }

    let webhookPayload = {}
    try {
      const requestText = await request.text()
      if (requestText) webhookPayload = JSON.parse(requestText)
    } catch (parseError) {
      return NextResponse.json(
        { message: 'Request body must be valid JSON or empty' },
        { status: 400 }
      )
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    })

    if (!workflow) {
      return NextResponse.json( 
        { message: `No workflow found with id '${workflowId}' for user '${userId}'` },
        { status: 404 }
      )
    }

    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId,
        metadata: webhookPayload,
      },
    })

    await workflowQueue.add(
      'process-workflow',
      { workflowRunId: workflowRun.id },
      { jobId: workflowRun.id }
    )

    return NextResponse.json({ 
      message: 'Webhook received and workflow queued for processing',
      data: {
        runId: workflowRun.id,
        workflowId: workflow.id,
      }
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return NextResponse.json(
      { message: 'An unexpected error occurred while processing the webhook' },
      { status: 500 }
    )
  }
}
