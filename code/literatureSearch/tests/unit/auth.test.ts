import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  credentialsMatch,
  isAuthEnabled,
  isAuthorizedSession,
} from "@/lib/auth";

const originalEnv = process.env;

describe("auth helpers", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_LOGIN_USERNAME;
    delete process.env.APP_LOGIN_PASSWORD;
    delete process.env.AUTH_SESSION_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("exposes the expected cookie name", () => {
    expect(AUTH_COOKIE_NAME).toBe("researchtool_session");
  });

  it("disables auth when credentials are not configured", async () => {
    expect(isAuthEnabled()).toBe(false);
    expect(credentialsMatch("user", "pass")).toBe(false);
    await expect(isAuthorizedSession(null)).resolves.toBe(true);
  });

  it("matches configured credentials and generates stable session tokens", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";
    process.env.AUTH_SESSION_SECRET = "secret";

    expect(isAuthEnabled()).toBe(true);
    expect(credentialsMatch("user", "pass")).toBe(true);
    expect(credentialsMatch("user", "wrong")).toBe(false);

    const token = await createSessionToken("user", "pass");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    await expect(isAuthorizedSession(token)).resolves.toBe(true);
    await expect(isAuthorizedSession("bad-token")).resolves.toBe(false);
  });

  it("falls back to the password when no session secret is provided", async () => {
    process.env.APP_LOGIN_USERNAME = "user";
    process.env.APP_LOGIN_PASSWORD = "pass";

    const token = await createSessionToken("user", "pass");
    expect(token).not.toBeNull();
    await expect(isAuthorizedSession(token)).resolves.toBe(true);
  });
});
