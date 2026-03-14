import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, isAuthEnabled, isAuthorizedSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  if (!isAuthEnabled()) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-md mx-auto pt-12">
          <header className="mb-8 text-center">
            <h1 className="font-serif text-4xl font-extrabold mb-3 bg-gradient-to-br from-foreground to-accent bg-clip-text text-transparent">
              Research Literature Search
            </h1>
            <p className="text-muted text-sm tracking-wide">
              Shared login is not enabled for this environment
            </p>
          </header>

          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/10">
            <p className="text-subtle text-sm mb-4">
              This environment does not require a login. Go back to the main app to search normally.
            </p>
            <a
              href="/"
              className="inline-flex bg-accent/85 hover:bg-accent text-background font-bold rounded-xl px-5 py-3 text-sm transition-all"
            >
              Return to search
            </a>
          </section>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (await isAuthorizedSession(token)) {
    redirect("/");
  }

  const redirectTo = typeof searchParams?.redirect === "string" ? searchParams.redirect : "/";
  const showError = searchParams?.error === "1";

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-md mx-auto pt-12">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-extrabold mb-3 bg-gradient-to-br from-foreground to-accent bg-clip-text text-transparent">
            Research Literature Search
          </h1>
          <p className="text-muted text-sm tracking-wide">
            Private access for your hosted copy
          </p>
        </header>

        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/10">
          <h2 className="font-serif text-2xl font-bold mb-2">Sign in</h2>
          <p className="text-subtle text-sm mb-6">
            Use the shared login credentials configured for this deployment.
          </p>

          {showError && (
            <p
              role="alert"
              className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm"
            >
              Incorrect username or password.
            </p>
          )}

          <form action="/api/auth/login" method="post" className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label htmlFor="username" className="block text-xs font-semibold tracking-widest text-muted uppercase mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground text-base placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold tracking-widest text-muted uppercase mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground text-base placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent/85 hover:bg-accent text-background font-bold rounded-xl px-6 py-3.5 text-sm transition-all"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
