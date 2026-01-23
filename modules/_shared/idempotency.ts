// modules/_shared/idempotency.ts
import { PrismaClient, type WebhookEvent } from "@prisma/client"
import { HttpError } from "./errors"

export type IdempotencyProvider = "clerk" | "stripe" | "other"

export type IdempotencyDeps = {
  prisma: PrismaClient
  now?: () => Date
}

export type EnsureOnceResult =
  | { shouldProcess: true; record: WebhookEvent }
  | { shouldProcess: false; record: WebhookEvent }

export const idempotencyService = {
  /**
   * Create-or-get an event record.
   * If it already exists, caller should skip processing.
   */
  async ensureOnce(
    deps: IdempotencyDeps,
    args: { provider: IdempotencyProvider; eventId: string }
  ): Promise<EnsureOnceResult> {
    const { prisma } = deps
    const now = deps.now ?? (() => new Date())

    try {
      const record = await prisma.webhookEvent.create({
        data: {
          provider: args.provider,
          eventId: args.eventId,
          receivedAt: now(),
        },
      })

      return { shouldProcess: true, record }
    } catch (err: any) {
      // Prisma unique violation => already received
      if (err?.code === "P2002") {
        const record = await prisma.webhookEvent.findUnique({
          where: { provider_eventId: { provider: args.provider, eventId: args.eventId } },
        })
        if (!record) throw err
        return { shouldProcess: false, record }
      }
      throw err
    }
  },

  /**
   * Mark the event as processed.
   */
  async markProcessed(
    deps: IdempotencyDeps,
    args: { provider: IdempotencyProvider; eventId: string }
  ) {
    const { prisma } = deps
    const now = deps.now ?? (() => new Date())

    return prisma.webhookEvent.update({
      where: { provider_eventId: { provider: args.provider, eventId: args.eventId } },
      data: { processedAt: now() },
    })
  },

  /**
   * Convenience helper for webhook actions:
   * - ensures once
   * - runs `work()` only if first time
   * - always returns ok for duplicates
   */
  async runOnce<T>(
    deps: IdempotencyDeps,
    args: { provider: IdempotencyProvider; eventId: string; work: () => Promise<T> }
  ): Promise<{ processed: boolean; result?: T }> {
    const gate = await this.ensureOnce(deps, { provider: args.provider, eventId: args.eventId })
    if (!gate.shouldProcess) return { processed: false }

    const result = await args.work()
    await this.markProcessed(deps, { provider: args.provider, eventId: args.eventId })
    return { processed: true, result }
  },
}
