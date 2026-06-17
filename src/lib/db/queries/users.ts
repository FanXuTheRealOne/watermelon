import { eq } from "drizzle-orm";
import { db } from "../client";
import { users, type NewUser } from "../schema/users";

export async function upsertUser(input: NewUser) {
  const { id, email, name, avatarUrl } = input;

  const [user] = await db
    .insert(users)
    .values({ id, email, name, avatarUrl })
    .onConflictDoUpdate({
      target: users.id,
      set: { email, name, avatarUrl, updatedAt: new Date() },
    })
    .returning();

  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}
