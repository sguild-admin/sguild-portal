## Copilot / AI Agent Instructions — Sguild

Purpose: quickly orient AI coding agents to be productive in this Next.js + Prisma + Clerk app.

Overview
- This repo uses the Next.js App Router in `app/`, Clerk for authentication, and Prisma (Postgres) for persistence. The app is multi-tenant by organization and uses role-based access control: super admin (global), org admin (per org), coach (per org).

Recommended architecture (pragmatic Clean Architecture)
- Interface layer: `app/`, `middleware.ts` — pages, layouts, server actions (`actions.ts`), route handlers (`route.ts`), and webhooks. Responsibilities: parse input, call use cases, return UI or HTTP responses. Allowed: server actions here. Forbidden: direct Prisma access.
- Application layer (use cases): `modules/**/*.usecases.ts` — authorization rules, validation, orchestration. Depends on repositories (interfaces) and domain types. Forbidden: Next.js-specific Request/Response objects.
- Infrastructure layer (repositories/adapters): `modules/**/*.repo.ts`, `lib/` — implement persistence (Prisma) and vendor adapters (Clerk, svix). Repos must not enforce authorization policy.

Auth & data model
- Clerk is the source of truth for sign-in and org context (`userId`, `orgId`). DB mirrors organizations and memberships (see `prisma/schema.prisma`): `Organization`, `AppUser`, `OrgMembership`. Use `lib/clerk.ts` helpers: `getClerkAuth()`, `requireClerkUserId()`, `requireClerkOrgId()`, `verifyClerkWebhook(request)` (dynamic `svix` import).
- Roles: Super admin (`AppUser.isSuperAdmin`), Org admin (`OrgMembership.role = ADMIN` + `status = ACTIVE`), Coach (`COACH` + `ACTIVE`). Always validate both role and `status` when authorizing.

Module layout examples (follow these when adding features)
- `modules/auth/` — `auth.usecases.ts`, `auth.repo.ts` (actor builds and guards).
- `modules/org/` — `org.usecases.ts`, `org.repo.ts` (org workflows & persistence).
- `modules/memberships/` — `memberships.usecases.ts`, `memberships.repo.ts`.

Developer workflows
- Dev server: `npm run dev`.
- Migrations (dev): `npx prisma migrate dev --name <name>`.
- Migrations (prod): `npx prisma migrate deploy`.
- Generate client: `npx prisma generate`.

Environment
- Required envs (validated in `lib/env.ts`): `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Optional: `CLERK_WEBHOOK_SECRET`, `DATABASE_URL_POOLER`.

Code patterns & rules (non-negotiable)
- `app/*` must call only `modules/*/*.usecases.ts` (never call repos directly).
- `*.usecases.ts` may call repos and adapters.
- `*.repo.ts` must be DB-only and must accept `orgId` for org-scoped queries.
- Keep webhooks thin: handlers call `verifyClerkWebhook()` then delegate to a use case.
- Do not statically import `svix`; dynamic import prevents crashes when not installed.

Common pitfalls & search tips
- Two Prisma clients exist: prefer `lib/prisma.ts` but check for `db/client.ts` usages before refactoring.
- Missing env vars cause startup errors; consult `lib/env.ts`.
- Search: `requireClerkUserId(`, `requireClerkOrgId(`, `verifyClerkWebhook(`, `prisma.`.

If you want, I can expand this with concrete examples (server action → use case → repo), or produce a small checklist for converting direct Prisma calls into repository implementations.
