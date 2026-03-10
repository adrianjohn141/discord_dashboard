"use client";

import { MenuIcon } from "@/components/dashboard/icons";
import { useDashboardShellState } from "@/components/dashboard/dashboard-shell-state";

export function DashboardSidebarToggleButton() {
  const { openSidebar } = useDashboardShellState();

  return (
    <button
      type="button"
      className="p-2 -ml-2 text-[var(--text-muted)] transition-colors hover:text-white lg:hidden"
      onClick={openSidebar}
    >
      <MenuIcon className="h-6 w-6" />
    </button>
  );
}
