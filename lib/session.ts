import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface Cookie {
  id?: number;
}

export function getSession() {
  return getIronSession<Cookie>(cookies(), {
    cookieName: "delicious-karrot",
    password: process.env.COOKIE_PASSWORD!,
  });
}

export async function saveSession(id: number) {
  const session = await getSession();
  session.id = id;
  await session.save();
}
