import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The fallback is only to allow `prisma generate` without database access.
    // Migration commands still require a real DIRECT_URL.
    url:
      process.env.DIRECT_URL ??
      "postgresql://prisma:prisma@localhost:5432/lunarlogic",
  },
});
