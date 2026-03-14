export const AUTH_COOKIE_NAME = "researchtool_session";

function getAuthConfig() {
  const username = process.env.APP_LOGIN_USERNAME?.trim();
  const password = process.env.APP_LOGIN_PASSWORD?.trim();
  const secret = process.env.AUTH_SESSION_SECRET?.trim() || password;

  return {
    username,
    password,
    secret,
    enabled: Boolean(username && password),
  };
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(username: string, password: string) {
  const { secret } = getAuthConfig();

  if (!secret) {
    return null;
  }

  return sha256(`${username}:${password}:${secret}`);
}

export async function isAuthorizedSession(token: string | undefined | null) {
  const { enabled, username, password } = getAuthConfig();

  if (!enabled || !username || !password || !token) {
    return !enabled;
  }

  const expectedToken = await createSessionToken(username, password);
  return token === expectedToken;
}

export function isAuthEnabled() {
  return getAuthConfig().enabled;
}

export function credentialsMatch(username: string, password: string) {
  const config = getAuthConfig();

  if (!config.enabled) {
    return false;
  }

  return username === config.username && password === config.password;
}
