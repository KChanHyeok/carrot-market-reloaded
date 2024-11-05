import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface Cookie {
  id?: number;
}

export default function getSession() {
  return getIronSession<Cookie>(cookies(), {
    cookieName: "delicious-karrot",
    password: process.env.COOKIE_PASSWORD!,
  });
}
