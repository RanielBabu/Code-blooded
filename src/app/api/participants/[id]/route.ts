import { getParticipant } from "@/lib/db/queries/participants";
import { fail, ok, route } from "@/lib/api/http";

export const GET = route(async (_request: Request, ctx: RouteContext<"/api/participants/[id]">) => {
  const { id } = await ctx.params;
  const participant = await getParticipant(id);
  if (!participant) {
    return fail(`Participant "${id}" was not found.`, 404, "PARTICIPANT_NOT_FOUND");
  }
  return ok(participant);
});
