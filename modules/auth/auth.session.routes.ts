import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    // normalize to exactly what the client needs
    const data = session?.user
      ? {
          signedIn: true,
          user: { id: session.user.id, email: session.user.email, name: session.user.name },
          session: {
            id: session.session?.id,
            activeOrganizationId: session.session?.activeOrganizationId ?? null,
            expiresAt: session.session?.expiresAt ?? null,
          },
        }
      : { signedIn: false, user: null, session: null }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    // if getSession throws, treat as signed out
    return NextResponse.json({
      ok: true,
      data: { signedIn: false, user: null, session: null },
    })
  }
}
