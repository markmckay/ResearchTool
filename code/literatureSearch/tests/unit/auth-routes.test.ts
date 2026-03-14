import { NextRequest } from "next/server";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { middleware } from "@/middleware";

const originalEnv = process.env;

function createLoginRequest(form: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(form)) {
    formData.set(key, value);
  }

  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: formData,
  });
}

describe("auth routes and middleware", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_LOGIN_USERNAME;
    delete process.env.APP_LOGIN_PASSWORD;
    delete process.env.AUTH_SESSION_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("redirects login submissions back home when auth is disabled", async () => {
    const response = await loginPost(
      createLoginRequest({ username: "user", password: "pass", redirectTo: "/priority" })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("rejects bad credentials and preserves safe redirect targets", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";

    const response = await loginPost(
      createLoginRequest({ username: "user", password: "wrong", redirectTo: "/priority" })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login?error=1&redirect=%2Fpriority");
  });

  it("sets the auth cookie and redirects after a successful login", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";
    process.env.AUTH_SESSION_SECRET = "secret";

    const response = await loginPost(
      createLoginRequest({ username: "user", password: "pass", redirectTo: "/priority" })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/priority");
    expect(response.cookies.get("researchtool_session")?.value).toMatch(/^[a-f0-9]{64}$/);
  });

  it("clears the auth cookie on logout", async () => {
    const response = await logoutPost(
      new NextRequest("http://localhost/api/auth/logout", { method: "POST" })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.cookies.get("researchtool_session")?.value).toBe("");
  });

  it("redirects unauthenticated page requests to login when auth is enabled", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";

    const response = await middleware(new NextRequest("http://localhost/?q=test"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?redirect=%2F%3Fq%3Dtest");
  });

  it("returns a 401 for protected API requests without a valid session", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";

    const response = await middleware(new NextRequest("http://localhost/api/search?q=test"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });
});
