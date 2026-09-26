import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://cognitivelab:cognitivelab@localhost:5433/cognitivelab",
  },
  strict: true,
  verbose: true,
});
