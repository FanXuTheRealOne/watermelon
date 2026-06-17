import { auth } from "@eazo/sdk";

export async function request(input: string | URL | Request, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const sessionHeader = await auth.getSessionHeader();

  if (sessionHeader) {
    headers.set("x-eazo-session", sessionHeader);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
