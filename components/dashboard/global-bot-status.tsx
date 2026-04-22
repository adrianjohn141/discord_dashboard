import type { ReactNode } from "react";

interface GlobalBotStatusProps {
  isOnline: boolean;
  lastHeartbeatAt: string | null;
}

export function GlobalBotStatus({ isOnline, lastHeartbeatAt }: GlobalBotStatusProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] shadow-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
        Bot {isOnline ? "Online" : "Offline"}
      </span>
      {lastHeartbeatAt && !isOnline && (
        <span className="hidden md:inline text-[10px] text-[var(--text-faint)] ml-1">
          Last seen: {new Date(lastHeartbeatAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
