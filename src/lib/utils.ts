import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coerce a value that reached a `number` slot as something else.
 *
 * These formatters sit at the end of the data path, where a value has already
 * been through JSON and, in the database layer, through the Postgres driver.
 * Postgres `numeric`/`real` arrive as strings, and a `sql<number>` template is a
 * compile-time assertion with no runtime effect, so a genuinely numeric column
 * can reach a formatter as `"91.8"`. Rendering that as an em dash is wrong --
 * it is real data -- but crashing the page with `toFixed is not a function` is
 * worse, and it takes the whole experiment list down over one bad cell.
 */
function asFiniteNumber(val: number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  // Not typed as reachable: this exists so a value of the wrong type degrades
  // to a dash rather than throwing inside a render.
  const coerced = Number(val as unknown as string);
  return Number.isFinite(coerced) ? coerced : null;
}

/**
 * Formatters accept null and render it as an em dash. A missing measurement is
 * displayed as absent, never as a zero.
 */
export function formatMs(ms: number | null | undefined): string {
  const n = asFiniteNumber(ms);
  if (n === null) return "—";
  return `${Math.round(n)} ms`;
}

export function formatPercent(val: number | null | undefined): string {
  const n = asFiniteNumber(val);
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

export function formatNumber(val: number | null | undefined): string {
  const n = asFiniteNumber(val);
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Timestamps render deterministically, in UTC, and never borrow the current
 * time.
 *
 * Two things are deliberate here.
 *
 * The locale and time zone are pinned rather than left to the runtime default.
 * `toLocaleString()` with no arguments resolves against whatever locale and
 * zone the host happens to use, so the same trial renders one way during
 * server rendering and another after hydration. The database stores
 * `timestamp with time zone`, and a research record is better served by an
 * unambiguous UTC stamp than by a clock that shifts with the reader's laptop.
 *
 * There is no `Date.now()` fallback. These call sites previously read
 * `trial.respondedAt || trial.startedAt || Date.now()`, which meant a trial
 * whose timestamps were missing displayed the moment the page happened to be
 * rendered, in the response-time column, as though it had been recorded. That is
 * a fabricated measurement in the one table a participant's raw data is read
 * from. An absent timestamp is rendered as an em dash.
 */
const TIMESTAMP_LOCALE = "en-US";

function parseTimestamp(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `Jan 2, 2026, 14:35:07 UTC` */
export function formatTimestamp(value: string | Date | null | undefined): string {
  const date = parseTimestamp(value);
  if (date === null) return "—";
  return new Intl.DateTimeFormat(TIMESTAMP_LOCALE, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

/** `14:35:07 UTC` */
export function formatClock(value: string | Date | null | undefined): string {
  const date = parseTimestamp(value);
  if (date === null) return "—";
  return new Intl.DateTimeFormat(TIMESTAMP_LOCALE, {
    timeStyle: "medium",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

/** `Jan 2, 2026` */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseTimestamp(value);
  if (date === null) return "—";
  return new Intl.DateTimeFormat(TIMESTAMP_LOCALE, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Reduce a caught value to a displayable message.
 *
 * `catch` receives `unknown`, so the value must be narrowed before its message
 * is read. Callers that only want a human-readable string should use this rather
 * than asserting a type, which is unsound and defeats the point of catching
 * `unknown`.
 */
export function toErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

export function downloadJsonFile(filename: string, data: unknown) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
