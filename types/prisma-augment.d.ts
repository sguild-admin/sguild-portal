/* eslint-disable @typescript-eslint/no-explicit-any */
import '@prisma/client'

declare module '@prisma/client' {
  // Augment PrismaClient with model accessors expected by the codebase.
  // These map to the generated client model names in some environments.
  interface PrismaClient {
    appUser: any
    orgMembership: any
  }
}
