import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { participants } from "../schema";
import { serializeParticipant } from "../serializers";
import type { Participant } from "@/types/participant";

export async function listParticipants(): Promise<Participant[]> {
  const rows = await db.select().from(participants).orderBy(desc(participants.lastActiveAt));
  return rows.map(serializeParticipant);
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const [row] = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
  return row ? serializeParticipant(row) : null;
}

export async function getParticipantsByIds(ids: string[]): Promise<Participant[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(participants)
    .where(sql`${participants.id} = any(${ids})`);
  return rows.map(serializeParticipant);
}
