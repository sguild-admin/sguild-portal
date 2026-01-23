// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

type PrismaGlobal = typeof globalThis & { __prisma?: PrismaClient }

const g = globalThis as PrismaGlobal

export const prisma =
  g.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") g.__prisma = prisma
