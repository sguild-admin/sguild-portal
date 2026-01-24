/* eslint-disable @typescript-eslint/no-explicit-any */
// types/prisma-augment.d.ts
// Local Prisma Client type extensions for environments where model typings differ.
import '@prisma/client'

declare module '@prisma/client' {
  // Augment PrismaClient with model accessors expected by the codebase.
  // These map to the generated client model names in some environments.
  interface PrismaClient {
    appUser: any
    orgMembership: any
  }
}
