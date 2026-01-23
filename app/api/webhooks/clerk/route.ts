// app/api/webhooks/clerk/route.ts
export const runtime = "nodejs"

import { webhooksRoutes } from "@/modules/webhooks/webhooks.routes"

export const POST = webhooksRoutes.clerk
export const GET = webhooksRoutes.health
