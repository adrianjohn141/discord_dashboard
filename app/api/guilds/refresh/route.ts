import { NextResponse } from "next/server";

import {
  dashboardCacheTags,
  revalidateDashboardTag,
} from "@/lib/db/cache-tags";
import { getCurrentProviderToken, requireUserSession } from "@/lib/auth/guards";
import { syncUserGuildAccess } from "@/lib/discord/guilds";

export async function POST() {
  const user = await requireUserSession();
  const providerToken = await getCurrentProviderToken();

  if (!providerToken) {
    return NextResponse.json(
      { error: "No Discord provider token is available for refresh. Sign in again." },
      { status: 400 },
    );
  }

  try {
    const rows = await syncUserGuildAccess(user, providerToken);
    revalidateDashboardTag(dashboardCacheTags.guildAccess(user.id));
    return NextResponse.json({
      ok: true,
      refreshed: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Guild access refresh failed.",
      },
      { status: 500 },
    );
  }
}
