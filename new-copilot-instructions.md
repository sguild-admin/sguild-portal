Copilot / AI Agent Instructions — Sguild

Purpose: quickly orient AI coding agents to be productive in this Next.js + Prisma + Clerk app using a recommended Clean Architecture pattern. Server actions remain in app/ as part of the interface layer.

Big picture: This is a Next.js App Router repo (app/) using Clerk for authentication and Prisma for Postgres (Supabase). The app is multi-tenant by organization and uses role based access control: super admin (global), org admin (per org), coach (per org).

Recommended architecture (Clean Architecture, pragmatic):

Interface layer: app/ and middleware.ts

Pages, layouts, server actions (actions.ts), route handlers (route.ts), webhooks

Responsibilities: parse input, call use cases, return UI or HTTP responses

Allowed: server actions live here

Forbidden: direct Prisma access

Application layer (use cases): modules/**.usecases.ts

Responsibilities: authorization rules, validation, orchestration, workflows

Depends on: repositories (interfaces) and domain types

Forbidden: Next.js Request, Response, FormData, redirect, revalidatePath

Infrastructure layer (repositories and adapters): modules/**.repo.ts, lib/

Repositories implement persistence using Prisma

Adapters wrap vendor specifics like Clerk server SDK and webhook verification

Forbidden: role policy inside repos

Entities: prisma/schema.prisma plus domain types (optional)

Prisma models define persisted entities

Optional domain types live in modules/**/types.ts

Layering rules (non negotiable):

app/* calls only modules/*/*.usecases.ts (never repos)

*.usecases.ts call repos and adapters

*.repo.ts is DB only and must not enforce authorization policy

All org owned data access must be scoped by internal orgId

Auth model (Clerk source of truth, DB mirror for app logic):

Clerk provides sign in and org context (userId, orgId)

DB mirrors organization and memberships:

Organization: internal UUID id, clerkOrgId unique, name

AppUser: internal UUID id, clerkUserId unique, isSuperAdmin boolean

OrgMembership: (orgId, clerkUserId) unique, role, status

Roles:

Super admin: AppUser.isSuperAdmin = true

Org admin: OrgMembership.role = ADMIN and status = ACTIVE

Coach: OrgMembership.role = COACH and status = ACTIVE

Key integration points:

Authentication: @clerk/nextjs

Server helpers in lib/clerk.ts:

getClerkAuth(), requireClerkUserId(), requireClerkOrgId()

verifyClerkWebhook(request) uses svix dynamic import

Database: Prisma schema in prisma/schema.prisma

Prisma client wrapper in lib/prisma.ts is the default

Some code may also use db/ adapter based client, inspect before refactors

Env vars: validated in lib/env.ts (required and optional vars)

Module layout (Clean Architecture aligned):

modules/auth/

auth.usecases.ts: build actor context and guards (requireSuperAdmin, requireOrgAdmin, requireCoachOrAdmin)

auth.repo.ts: reads AppUser, Organization, OrgMembership

modules/org/

org.usecases.ts: org workflows (sync from webhook, list orgs for super admin)

org.repo.ts: org persistence

modules/memberships/

memberships.usecases.ts: assign roles, enable, disable, list members, sync from webhook

memberships.repo.ts: membership persistence

modules/superAdmin/

superAdmin.usecases.ts: cross org workflows (assign org admin, toggle super admin)

superAdmin.repo.ts: DB operations for cross org views

How authorization is enforced:

Interface layer obtains Clerk identity:

clerkUserId from requireClerkUserId()

clerkOrgId from requireClerkOrgId() when org scoped

Use cases build an actor and enforce policy:

Load Organization by clerkOrgId to get internal orgId

Load OrgMembership by (orgId, clerkUserId) and require status = ACTIVE

Load AppUser by clerkUserId for isSuperAdmin

Repos do not check roles. Repos do require orgId parameters for org owned tables.

Developer workflows / commands:

Dev server: npm run dev

Create and apply migrations: npx prisma migrate dev --name <name>

Apply migrations in production: npx prisma migrate deploy

Generate Prisma client: npx prisma generate

Required env vars (checked in lib/env.ts):

DATABASE_URL

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

CLERK_SECRET_KEY

Optional: CLERK_WEBHOOK_SECRET, DATABASE_URL_POOLER

Code patterns & conventions:

Server actions:

Live in app/**/actions.ts

Parse FormData or inputs

Call a single use case per action

Handle redirects or revalidation in the action, not in the use case

Webhooks:

Handlers in app/api/webhooks/clerk/route.ts

Must call verifyClerkWebhook(request)

Keep handlers thin, delegate to use cases

Multi tenancy:

Every query includes orgId scope for org owned data

Avoid querying by email or clerkUserId alone for org owned resources

Errors:

Prefer lib/errors.ts to standardize Unauthorized, Forbidden, NotFound, BadRequest

Route handlers return consistent JSON errors

No em dashes:

Do not introduce em dashes in code comments, docs, or generated text

Common pitfalls:

Direct Prisma calls inside app/ violate the architecture, move them into repos and use cases.

Do not statically import svix in shared modules, keep it dynamically imported in webhook verification.

Ensure membership authorization checks include both role and status = ACTIVE.

Confirm whether nearby code uses lib/prisma.ts or a db/ adapter client before changing imports.

Search hints:

Auth guards: search requireClerkUserId(, requireClerkOrgId(

Webhooks: search verifyClerkWebhook(

Prisma usage: search prisma. and confirm it is not inside app/

Repo boundaries: search for imports ending in .repo from any app/ file and remove them