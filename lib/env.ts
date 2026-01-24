// lib/env.ts
// Centralized environment variable access with validation.
// Read a required env var or throw with a clear message.
function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.trim().length === 0) throw new Error(`Missing env var: ${name}`)
  return v
}

// Read an optional env var and normalize empty strings.
function optionalEnv(name: string): string | undefined {
  const v = process.env[name]
  return v && v.trim().length > 0 ? v : undefined
}

// Frozen env object for predictable access across the app.
export const env = Object.freeze({
  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "test"
    | "production",

  DATABASE_URL: requireEnv("DATABASE_URL"),
  DATABASE_URL_POOLER: optionalEnv("DATABASE_URL_POOLER"),

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),

  // Clerk webhooks (Svix)
  CLERK_WEBHOOK_SECRET: optionalEnv("CLERK_WEBHOOK_SECRET"),
})

export default env
