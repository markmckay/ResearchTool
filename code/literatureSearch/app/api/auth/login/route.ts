import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSessionToken, credentialsMatch, isAuthEnabled } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const formData = await req.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (!credentialsMatch(username, password)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "1");
    if (redirectTo.startsWith("/")) {
      loginUrl.searchParams.set("redirect", redirectTo);
    }
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const token = await createSessionToken(username, password);

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=1", req.url), { status: 303 });
  }

  const response = NextResponse.redirect(
    new URL(redirectTo.startsWith("/") ? redirectTo : "/", req.url),
    { status: 303 }
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
