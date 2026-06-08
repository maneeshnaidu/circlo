import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL,
  },
})
