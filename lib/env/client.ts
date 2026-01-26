import { z } from "zod"

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

export const clientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
