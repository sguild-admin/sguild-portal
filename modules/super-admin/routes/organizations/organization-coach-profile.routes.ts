import { GET as getProfile, PATCH as updateProfile } from "@/modules/coach-profiles/routes/super-admin/org-coach-profile.route"

export async function GET(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  return getProfile(req, ctx)
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  return updateProfile(req, ctx)
}
