// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/api/webhooks(.*)",
])

const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/admin(.*)",
  "/coach(.*)",
  "/api(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
