import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { organization } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import { prisma } from "../db/prisma"

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL

if (!BETTER_AUTH_SECRET) throw new Error("Missing BETTER_AUTH_SECRET")
if (!BETTER_AUTH_URL) throw new Error("Missing BETTER_AUTH_URL")

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: { enabled: true },

  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: { clientId: googleClientId, clientSecret: googleClientSecret },
        }
      : {},

  plugins: [organization(), nextCookies()],
})
