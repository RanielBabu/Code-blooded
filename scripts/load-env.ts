/**
 * Loads `.env.local` before any other module reads `process.env`.
 *
 * `tsx` does not load Next's env files, and `import` statements are hoisted
 * above top-level statements, so the dotenv load has to happen in a separate
 * module that is imported first.
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, quiet: true });
    break;
  }
}
