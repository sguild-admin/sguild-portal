// db/client.ts
// Prisma client singleton with Pg adapter + pool reuse in dev.
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// Cache across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pgPool?: Pool
}

// Use pooled DATABASE_URL for runtime queries.
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")

// Reuse pool between hot reloads to avoid exhausting connections.
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool

// Prisma client configured for the Pg adapter.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
