import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { userRouter } from './routes/userRouter.js'
import { workflowRouter } from './routes/workflowRouter.js'
import { credentialsRouter } from './routes/credentialsRouter.js'
import { triggerRouter } from './routes/triggerRouter.js'
import { actionRouter } from './routes/actionRouter.js'
import { hooksRouter } from './routes/hooksRouter.js'

const app = express()
const PORT = process.env.API_PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/workflow', workflowRouter)
app.use('/api/v1/credentials', credentialsRouter)
app.use('/api/v1/trigger', triggerRouter)
app.use('/api/v1/action', actionRouter)
app.use('/hooks', hooksRouter)

app.listen(PORT, () => {
  console.log(`FlowGrid API server running on port ${PORT}`)
})