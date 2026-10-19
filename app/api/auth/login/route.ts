import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const name = String(formData.get("name") || "").trim() || "Founder";
  const returnTo = String(formData.get("return_to") || "/admin");

  const requiredPassword =
    (typeof env !== "undefined" &&
      (env as Record<string, string | undefined>).ADMIN_PASSWORD) ||
    process.env.ADMIN_PASSWORD;

  if (requiredPassword && password !== requiredPassword) {
    const errorUrl = new URL(
      `/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}&error=incorrect_password`,
      request.url,
    );
    return NextResponse.redirect(errorUrl, 303);
  }

  const cookiePayload = encodeURIComponent(
    JSON.stringify({
      email: email || "founder@quazar.test",
      name: name || "Founder",
    }),
  );

  const redirectUrl = new URL(
    returnTo.startsWith("/") ? returnTo : "/admin",
    request.url,
  );
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set("__sites_local_auth", cookiePayload, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
