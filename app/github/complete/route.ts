import db from "@/lib/db";
import { saveSession } from "@/lib/session";
import { getGitHubAccessToken, getGitHubEmail, getGitHubProfile } from "@/utils/commond";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return notFound();

  const { error, access_token } = await getGitHubAccessToken(code);

  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  const { id, avatar_url, login } = await getGitHubProfile(access_token);
  const email = await getGitHubEmail(access_token);
  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
      email: true,
    },
  });
  if (user) {
    if (!user?.email) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: { email: email[0].email },
      });
    }
    await saveSession(user.id);
    return redirect("/profile");
  }
  const newUser = await db.user.create({
    data: {
      username: login,
      github_id: id + "",
      avatar: avatar_url,
      email: email[0].email,
    },
    select: {
      id: true,
    },
  });
  await saveSession(newUser.id);
  return redirect("/profile");
}
