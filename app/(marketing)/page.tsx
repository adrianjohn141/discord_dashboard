import { redirect } from "next/navigation";

import { DiscordAuthScreen } from "@/components/auth/discord-auth-screen";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <DiscordAuthScreen
      eyebrow="Sentinel access"
      title="Sign in to your moderation dashboard"
      description="Manage your Discord servers, review moderation activity, and adjust AutoMod policy from a single control room"
    />
  );
}
