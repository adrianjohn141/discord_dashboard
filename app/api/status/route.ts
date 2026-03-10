import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAccessibleGuilds } from "@/lib/db/queries";
import type { StatusRoutePayload } from "@/types/dashboard";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const payload: StatusRoutePayload = {
      authenticated: false,
      guildCount: 0,
      userId: null,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  }

  const guilds = await getAccessibleGuilds(user.id);
  const payload: StatusRoutePayload = {
    authenticated: true,
    guildCount: guilds.length,
    userId: user.id,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
