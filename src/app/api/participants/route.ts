import { listParticipants } from "@/lib/db/queries/participants";
import { ok, route } from "@/lib/api/http";

export const GET = route(async () => {
  return ok(await listParticipants());
});
