import { PATCH as updateAdmin, DELETE as removeAdmin } from "@/modules/members/routes/super-admin/org-admin-member.route"

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  return updateAdmin(req, ctx)
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  return removeAdmin(req, ctx)
}
