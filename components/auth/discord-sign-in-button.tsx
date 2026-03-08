"use client";

import { startTransition, useState } from "react";

import { ArrowRightIcon, DiscordIcon } from "@/components/dashboard/icons";
import { createClient } from "@/lib/supabase/client";

interface DiscordSignInButtonProps {
  next?: string;
  className?: string;
}

export function DiscordSignInButton({
  next = "/dashboard",
  className,
}: DiscordSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = () => {
    setError(null);
    setIsPending(true);

    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo,
          scopes: "identify guilds email",
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsPending(false);
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignIn}
        className={
          className ??
          "oauth-button"
        }
      >
        <span className="flex items-center gap-3 text-base font-semibold sm:gap-4 sm:text-lg">
          <DiscordIcon className="h-7 w-9 sm:h-8 sm:w-10" />
          <span>{isPending ? "Redirecting to Discord..." : "Continue with Discord"}</span>
        </span>
        <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
