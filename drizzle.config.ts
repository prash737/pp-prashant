
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/drizzle/schema.ts',
  out: './lib/drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
