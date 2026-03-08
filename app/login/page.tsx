import { redirect } from "next/navigation";

import { DiscordAuthScreen } from "@/components/auth/discord-auth-screen";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <DiscordAuthScreen
      eyebrow="Discord OAuth"
      title="Sign in to your dashboard"
      description="This dashboard authenticates with Discord through Supabase Auth, refreshes your manageable guild list, and keeps every configuration write inside your server-side authorization scope."
    />
  );
}
