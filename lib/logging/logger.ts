// lib/logging/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error"

type LogContext = Record<string, unknown>

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return "[unserializable]"
  }
}

function normalize(message: unknown, context?: LogContext) {
  const msg =
    typeof message === "string"
      ? message
      : message instanceof Error
        ? message.message
        : safeJson(message)

  const ctx = context ? safeJson(context) : undefined

  return { msg, ctx }
}

export const logger = {
  debug(message: unknown, context?: LogContext) {
    if (process.env.NODE_ENV === "production") return
    const { msg, ctx } = normalize(message, context)
    console.debug(msg, ctx)
  },

  info(message: unknown, context?: LogContext) {
    const { msg, ctx } = normalize(message, context)
    console.info(msg, ctx)
  },

  warn(message: unknown, context?: LogContext) {
    const { msg, ctx } = normalize(message, context)
    console.warn(msg, ctx)
  },

  error(message: unknown, context?: LogContext) {
    const { msg, ctx } = normalize(message, context)
    console.error(msg, ctx)
  },
}
