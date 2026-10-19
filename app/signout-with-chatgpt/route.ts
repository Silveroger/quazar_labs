import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return handleSignOut(request);
}

export async function POST(request: Request) {
  return handleSignOut(request);
}

function handleSignOut(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || "/";
  const redirectUrl = new URL(
    returnTo.startsWith("/") ? returnTo : "/",
    request.url,
  );
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set("__sites_local_auth", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}
