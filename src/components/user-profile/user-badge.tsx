"use client";

import { useEazo } from "@eazo/sdk/react";

export function UserBadge() {
  const user = useEazo((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-soft-ink)]">
      {user.avatarUrl && (
        <img src={user.avatarUrl} alt={user.name || ""} className="h-6 w-6 rounded-full" />
      )}
      <span>{user.name || user.email || user.id}</span>
    </div>
  );
}
