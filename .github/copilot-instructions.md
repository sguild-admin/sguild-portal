Sguild app AI instructions

## Big picture
- Next.js App Router with Clerk auth and Prisma Postgres. UI and API entrypoints live in app/ only.
- All server side business logic lives in modules/ by domain, including server actions and webhooks.
- Multi tenant by organization. All org owned data access must be scoped by internal orgId.

## Folder responsibilities
- app/ renders UI and re exports module route handlers from app/api/**/route.ts.
- modules/ owns all backend logic and contracts per domain.
- lib/ contains infra helpers like Prisma and Clerk utilities.

## Module file layout and roles
- Use only these filenames per module: <module>.routes.ts, <module>.actions.ts, <module>.service.ts, <module>.repo.ts, <module>.schema.ts, <module>.dto.ts, index.ts.
- routes.ts parses Request and returns Response.json. No Prisma or business logic.
- actions.ts owns orchestration, authz, Zod validation, DTO mapping, and server actions. Return DTOs only.
- service.ts holds domain rules and transitions. No Request, Response, or auth reads.
- repo.ts is Prisma only. No authz or validation. Accept Prisma.TransactionClient for transactions.

## Auth and tenancy
- Centralize permission checks in modules/authz/authz.service.ts. Actions call authzService helpers.
- Clerk helpers live in lib/clerk.ts, including requireClerkUserId and requireClerkOrgId.

## Webhooks
- app/api/webhooks/clerk/route.ts re exports handlers from modules/webhooks.
- webhooks.routes.ts verifies signatures then delegates to webhooks.actions.ts.
- Wrap side effects with idempotencyService.runOnce keyed by provider and eventId.

## API and exports
- app/api/**/route.ts files only re export module handlers. No logic in app/api.
- module index.ts exports routes and actions. Export dto or schema only if needed by UI.

## Schema change workflow
1) Update prisma/schema.prisma
2) Create migration
3) Update repo methods
4) Update services
5) Update schemas and DTOs
6) Update actions
7) Update routes
8) Update webhooks and authz if behavior or permissions change
