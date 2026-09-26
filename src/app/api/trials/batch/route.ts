import { z } from "zod";
import { recordTrialRun, TrialRunError } from "@/lib/db/queries/trials";
import { fail, ok, route } from "@/lib/api/http";
import { TrialResultSchema } from "@/schemas/experiment.schema";

/**
 * Batch trial submission.
 *
 * The client-generated `id` and `participantId` are discarded rather than
 * trusted: both are allocated server-side, because the client has no way to
 * produce a collision-free participant id and a duplicate would silently merge
 * two subjects' data.
 */
const BatchSchema = z.object({
  participantName: z.string().max(200).default(""),
  trials: z.array(TrialResultSchema).min(1, "A trial run must contain at least one trial."),
});

export const POST = route(async (request: Request) => {
  const body = await request.json();

  const parsed = BatchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Trial batch failed validation.", 400, "VALIDATION_ERROR", parsed.error.issues);
  }

  try {
    const result = await recordTrialRun(parsed.data.participantName, parsed.data.trials);
    return ok(result, { status: 201 });
  } catch (error) {
    if (error instanceof TrialRunError) {
      return fail(error.message, error.status, error.code);
    }
    throw error;
  }
});
