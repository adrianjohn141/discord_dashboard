import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getGuildAccessRecord } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import type { DashboardUser } from "@/types/dashboard";

function getPreferredDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};

  return (
    metadata.full_name ??
    metadata.custom_claims?.global_name ??
    metadata.name ??
    metadata.user_name ??
    user.email ??
    "Discord User"
  );
}

export async function requireUserSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentDashboardUser(): Promise<DashboardUser> {
  const user = await requireUserSession();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: String(getPreferredDisplayName(user)),
    avatarUrl:
      String(user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "") || null,
  };
}

export async function getCurrentProviderToken() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.provider_token ?? null;
}

export async function requireGuildAccess(guildId: string) {
  const user = await requireUserSession();
  const accessRecord = await getGuildAccessRecord(user.id, guildId);

  if (!accessRecord?.canManage) {
    redirect("/dashboard");
  }

  return { user, accessRecord };
}

export function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }

  return next;
}
