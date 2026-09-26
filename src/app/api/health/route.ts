import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ok, route } from "@/lib/api/http";

/**
 * Liveness plus a real database round-trip.
 *
 * Reports `ok: false` with a 503 when the database is unreachable, so a load
 * balancer or the settings page can distinguish "server up" from "server able
 * to serve data". No connection details are echoed back to the caller.
 */
export const GET = route(async () => {
  try {
    await db.execute(sql`select 1`);
    return ok({ status: "healthy", database: "reachable" });
  } catch {
    return ok({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
});
