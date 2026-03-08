import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="panel w-full max-w-xl rounded-[32px] p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.34em] text-[var(--danger)]">
          Authentication Error
        </p>
        <h1 className="mt-5 text-3xl font-semibold text-white">
          The Discord login flow did not complete cleanly
        </h1>
        <p className="mt-4 text-base leading-7 subtle-copy">
          Re-try the sign-in flow. If the problem persists, verify the Supabase
          Discord provider settings and callback URLs.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 font-medium text-white transition hover:bg-[#7d97ff]"
          >
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
