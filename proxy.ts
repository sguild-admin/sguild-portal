// proxy.ts
// Clerk middleware configuration for public/protected routes.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Public routes do not require auth.
const isPublicRoute = createRouteMatcher([
  "/api/webhooks(.*)",
])

// Protected routes require auth.
const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/api(.*)",
])

// Apply Clerk auth based on route matchers.
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  if (isProtectedRoute(req)) await auth.protect()
})

// Next.js middleware matcher config.
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
