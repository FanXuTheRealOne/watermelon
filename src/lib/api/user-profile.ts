import { request } from "./request";

export interface ProfileUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export async function fetchUserProfile(): Promise<ProfileUser> {
  const res = await request("/api/user/profile");
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}
