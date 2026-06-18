import { eq, desc, and } from "drizzle-orm";
import { db } from "../client";
import { analyses, type NewAnalysis } from "../schema/analyses";

export async function createAnalysis(input: NewAnalysis) {
  const [analysis] = await db.insert(analyses).values(input).returning();
  return analysis;
}

export async function getAnalysesByUserId(userId: string, limit = 20) {
  return db
    .select()
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(limit);
}

export async function getAnalysisById(id: number, userId: string) {
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.id, id), eq(analyses.userId, userId)))
    .limit(1);
  return analysis || null;
}
