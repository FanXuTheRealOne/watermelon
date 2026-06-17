import { pgTable, bigserial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const analyses = pgTable("analyses", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  label: text("label").notNull(),
  tagline: text("tagline").notNull(),
  summary: text("summary").notNull(),
  reasons: text("reasons").array().notNull(),
  tips: text("tips").array().notNull(),
  features: jsonb("features").notNull(),
  aiUsed: integer("ai_used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
