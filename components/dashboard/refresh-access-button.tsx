"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { RefreshIcon } from "@/components/dashboard/icons";

export function RefreshAccessButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setMessage(null);
    setIsPending(true);

    startTransition(async () => {
      const response = await fetch("/api/guilds/refresh", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setMessage(payload?.error ?? "Guild access refresh failed.");
        setIsPending(false);
        return;
      }

      setMessage("Guild access refreshed.");
      setIsPending(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        className="secondary-button px-3 py-2 text-sm font-medium sm:px-3.5 sm:py-2.5"
      >
        <RefreshIcon className="h-4 w-4" />
        {isPending ? "Refreshing..." : "Refresh Access"}
      </button>
      {message ? <p className="text-xs text-[var(--text-muted)]">{message}</p> : null}
    </div>
  );
}
