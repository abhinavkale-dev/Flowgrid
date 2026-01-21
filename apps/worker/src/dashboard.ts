import express from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'  
import { ExpressAdapter } from '@bull-board/express'
import { workflowQueue } from '@repo/shared'

const app = express()
const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullMQAdapter(workflowQueue)],
  serverAdapter: serverAdapter,
})

app.use('/admin/queues', serverAdapter.getRouter())

const PORT = process.env.BULL_BOARD_PORT || 3002

const server = app.listen(PORT, () => {
  console.log(`Bull Board Dashboard: http://localhost:${PORT}/admin/queues`)
})

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down dashboard...`)
  server.close()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))