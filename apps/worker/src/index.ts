import { prisma } from '@repo/prisma'
import { parseTemplate } from '@repo/shared'
import nodemailer from 'nodemailer'
import OpenAI from 'openai'
import 'dotenv/config'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function processWorkflowRun(runId: string) {
  try {
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        workflow: {
          include: {
            actions: {
              include: {
                type: true,
              },
              orderBy: {
                sortingOrder: 'asc',
              },
            },
          },
        },
      },
    })

    if (!run) {
      console.error('Workflow run not found')
      return
    }

    let currentMetadata = run.metadata as Record<string, any>

    for (const action of run.workflow.actions) {
      try {
        const actionMetadata = action.metadata as Record<string, any>

        switch (action.type.id) {
          case 'email':
            await executeEmailAction(actionMetadata, currentMetadata)
            break
          case 'slack':
            await executeSlackAction(actionMetadata, currentMetadata)
            break
          case 'telegram':
            await executeTelegramAction(actionMetadata, currentMetadata)
            break
          case 'discord':
            await executeDiscordAction(actionMetadata, currentMetadata)
            break
          case 'openai':
            const aiResponse = await executeOpenAIAction(
              actionMetadata,
              currentMetadata
            )
            currentMetadata = { ...currentMetadata, aiResponse }
            break
          default:
            console.log(`Unknown action type: ${action.type.id}`)
        }
      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error)

        await prisma.workflowRun.update({
          where: { id: runId },
          data: {
            status: 'Error',
            errorMetadata: {
              message:
                error instanceof Error ? error.message : 'Unknown error',
              actionId: action.id,
            },
          },
        })
        return
      }
    }

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'Complete',
        finishedAt: new Date(),
        metadata: currentMetadata,
      },
    })

    console.log(`Workflow run ${runId} completed successfully`)
  } catch (error) {
    console.error(`Error processing workflow run ${runId}:`, error)

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'Error',
        errorMetadata: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    })
  }
}

async function executeEmailAction(
  actionMetadata: Record<string, any>,
  runMetadata: Record<string, any>
) {
  const { credentialId, to, subject, body, from } = actionMetadata

  const credential = await prisma.credentials.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error('Email credentials not found')
  }

  const keys = credential.keys as Record<string, any>
  const apiKey = keys.apiKey as string

  const parsedTo = parseTemplate(to, runMetadata)
  const parsedSubject = parseTemplate(subject, runMetadata)
  const parsedBody = parseTemplate(body, runMetadata)
  const parsedFrom = parseTemplate(from, runMetadata)

  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: apiKey,
    },
  })

  await transporter.sendMail({
    from: parsedFrom,
    to: parsedTo,
    subject: parsedSubject,
    text: parsedBody,
    html: `<p>${parsedBody}</p>`,
  })

  console.log(`Email sent to ${parsedTo}`)
}

async function executeSlackAction(
  actionMetadata: Record<string, any>,
  runMetadata: Record<string, any>
) {
  const { credentialId, channel, message } = actionMetadata

  const credential = await prisma.credentials.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error('Slack credentials not found')
  }

  const keys = credential.keys as Record<string, any>
  const webhookUrl = keys.webhookUrl as string

  const parsedMessage = parseTemplate(message, runMetadata)

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: parsedMessage }),
  })

  if (!response.ok) {
    throw new Error('Failed to send Slack message')
  }

  console.log(`Slack message sent to ${channel || 'default channel'}`)
}

async function executeTelegramAction(
  actionMetadata: Record<string, any>,
  runMetadata: Record<string, any>
) {
  const { credentialId, chatId, message } = actionMetadata

  const credential = await prisma.credentials.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error('Telegram credentials not found')
  }

  const keys = credential.keys as Record<string, any>
  const botToken = keys.botToken as string

  const parsedMessage = parseTemplate(message, runMetadata)
  const parsedChatId = parseTemplate(chatId, runMetadata)

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: parsedChatId,
        text: parsedMessage,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to send Telegram message')
  }

  console.log(`Telegram message sent to chat ${parsedChatId}`)
}

async function executeDiscordAction(
  actionMetadata: Record<string, any>,
  runMetadata: Record<string, any>
) {
  const { webhookUrl, message, username } = actionMetadata

  const parsedMessage = parseTemplate(message, runMetadata)
  const parsedUsername = parseTemplate(username || 'FlowGrid Bot', runMetadata)

  const discordWebhook = webhookUrl || process.env.DISCORD_WEBHOOK_URL

  if (!discordWebhook) {
    throw new Error('Discord webhook URL not configured')
  }

  const response = await fetch(discordWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: parsedMessage,
      username: parsedUsername,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send Discord message: ${errorText}`)
  }

  console.log(`Discord message sent via webhook`)
}

async function executeOpenAIAction(
  actionMetadata: Record<string, any>,
  runMetadata: Record<string, any>
): Promise<string> {
  const { credentialId, prompt, model = 'gpt-3.5-turbo' } = actionMetadata

  const credential = await prisma.credentials.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    throw new Error('OpenAI credentials not found')
  }

  const keys = credential.keys as Record<string, any>
  const apiKey = keys.apiKey as string

  const parsedPrompt = parseTemplate(prompt, runMetadata)

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: parsedPrompt }],
  })

  const aiResponse = response.choices[0]?.message?.content || ''

  console.log(`OpenAI response generated`)

  return aiResponse
}

async function main() {
  console.log('Worker started - polling for workflow runs...')

  while (true) {
    try {
      const pending = await prisma.workflowRunOutbox.findMany({
        take: 10,
      })

      for (const outboxItem of pending) {
        await processWorkflowRun(outboxItem.workflowRunId)

        await prisma.workflowRunOutbox.delete({
          where: { id: outboxItem.id },
        })
      }

      await sleep(1000)
    } catch (error) {
      console.error('Error in worker loop:', error)
      await sleep(5000)
    }
  }
}

main()





