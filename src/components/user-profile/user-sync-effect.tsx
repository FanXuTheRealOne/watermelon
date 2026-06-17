"use client";

import { useEffect } from "react";
import { useEazo } from "@eazo/sdk/react";
import { device } from "@eazo/sdk";
import { fetchUserProfile } from "@/lib/api/user-profile";

export function UserSyncEffect() {
  const authenticated = useEazo((s) => s.auth.authenticated);

  useEffect(() => {
    if (authenticated && device.platform === "mobile") {
      fetchUserProfile().catch(() => {});
    }
  }, [authenticated]);

  return null;
}
