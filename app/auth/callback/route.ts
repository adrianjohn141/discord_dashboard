import { NextResponse } from "next/server";

import { normalizeNextPath } from "@/lib/auth/guards";
import { syncUserGuildAccess } from "@/lib/discord/guilds";
import { upsertDashboardProfile } from "@/lib/db/mutations";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeNextPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  if (user) {
    await upsertDashboardProfile(user);

    if (session?.provider_token) {
      try {
        await syncUserGuildAccess(user, session.provider_token);
      } catch {
        return NextResponse.redirect(`${origin}/dashboard?refresh=required`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
