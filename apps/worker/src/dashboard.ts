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
  console.log(`FlowGrid Worker Dashboard running at http://localhost:${PORT}/admin/queues`)
})

process.on('SIGINT', () => {
  console.log('Dashboard shutting down...')
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Dashboard shutting down...')
  server.close()
  process.exit(0)
})