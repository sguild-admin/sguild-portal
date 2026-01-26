// lib/utils/zod.ts
import { z } from "zod"

export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const res = schema.safeParse(value)
  if (!res.success) {
    const message = res.error.issues
      .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ")
    throw new Error(message)
  }
  return res.data
}

export function zodErrorMessage(err: z.ZodError) {
  return err.issues
    .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
    .join("; ")
}
