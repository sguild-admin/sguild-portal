# Sguild App Copilot Instructions

## Architecture overview
- Next.js App Router app with domain logic in modules/<module>/... and thin routing in app/api/**/route.ts.
- API flow: app/api/**/route.ts re-exports handlers from modules/**/routes (example: app/api/bootstrap/route.ts → modules/bootstrap/bootstrap.routes.ts).
- Module boundaries: schemas in modules/<module>/<module>.schema.ts (Zod), DB access in modules/<module>/<module>.repo.ts, business logic in modules/<module>/<module>.service.ts, output shaping in modules/<module>/<module>.dto.ts, and explicit exports in modules/<module>/index.ts (no export *).
- Prisma client singleton in lib/db/prisma.ts; schema in prisma/schema.prisma; migrations in prisma/migrations.

## API conventions
- Standard responses use lib/http/response.ts helpers `ok()` and `fail()`; match shape { ok: true, data } or { ok: false, error }.
- Auth guards only from lib/auth/guards.ts: `requireSession`, `requireActiveOrgId`, `getActiveRoles`, `requireAdminOrOwner`, `requireSuperAdmin`.
- Prefer org context from session.activeOrganizationId; membership identity uses memberId (not userId).
- REST paths: /api/<module> (list/create), /api/<module>/me (current user), /api/<module>/active (active selection); avoid action-switch routes.

## Auth + bootstrap
- Better Auth server in lib/auth/auth.ts and React client in lib/auth/auth-client.ts.
- Auth handler lives at app/api/auth/[...all]/route.ts; session check at GET /api/auth/session.
- Bootstrap endpoint GET /api/bootstrap returns a single payload: signedIn, user, session, activeOrg, roles, superAdmin, orgSettings (see modules/bootstrap/bootstrap.routes.ts). UI should call /api/bootstrap once on load.

## UI structure
- UI primitives in components/ui; shared portal layout in components/shell (PortalShell, PortalHeader, PortalNav); reusable app components in components/common.
- Feature UI for a portal area lives in app/portal/<area>/_components; pages should stay thin and compose feature components.

## Workflows
- Dev server: npm run dev. Build: npm run build (runs prisma generate). Lint: npm run lint.
- Prisma client generation runs on postinstall; use prisma/schema.prisma as source of truth.