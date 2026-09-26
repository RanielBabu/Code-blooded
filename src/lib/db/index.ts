import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start the database with `docker compose up -d`."
    );
  }

  // `prepare: false` keeps the driver compatible with transaction-mode poolers
  // (PgBouncer, Neon, Supabase), which do not support prepared statements.
  const client = postgres(url, { max: 10, prepare: false });
  return drizzle(client, { schema });
}

/**
 * Cached on `globalThis` in development so `next dev`'s hot reloading does not
 * open a new connection pool on every edit. Without this, reloading the server
 * repeatedly exhausts PostgreSQL's connection limit.
 */
const globalForDb = globalThis as unknown as { __cognitivelabDb?: Database };

export const db: Database = globalForDb.__cognitivelabDb ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__cognitivelabDb = db;
}

export { schema };
