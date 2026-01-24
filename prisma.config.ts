// prisma.config.ts
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Use a DIRECT connection for migrations (not the pooler)
    url: env("DIRECT_URL"),
  },
})
