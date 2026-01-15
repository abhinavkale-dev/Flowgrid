import { PrismaClient } from '../../../../packages/prisma/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../../../.env') })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const adapter = new PrismaPg({ 
  connectionString 
})

export const prisma = new PrismaClient({ adapter })

