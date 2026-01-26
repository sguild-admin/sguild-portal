// lib/env/server.ts
import { z } from "zod"

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),

  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
})

export const env = ServerEnvSchema.parse(process.env)

export type ServerEnv = z.infer<typeof ServerEnvSchema>
