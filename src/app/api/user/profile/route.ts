import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { upsertUser } from "@/lib/db/queries/users";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id, email, name, avatarUrl } = auth.user;

  // Upsert is fire-and-forget; we still return the session user immediately.
  upsertUser({ id, email, name, avatarUrl }).catch(() => {});

  return NextResponse.json(auth.user);
}
