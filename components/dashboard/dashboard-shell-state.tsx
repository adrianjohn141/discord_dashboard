"use client";

import { createContext, useContext, useState } from "react";

interface DashboardShellStateValue {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const DashboardShellStateContext = createContext<DashboardShellStateValue | null>(null);

export function DashboardShellStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardShellStateContext.Provider
      value={{
        isSidebarOpen,
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),
      }}
    >
      {children}
    </DashboardShellStateContext.Provider>
  );
}

export function useDashboardShellState() {
  const context = useContext(DashboardShellStateContext);

  if (!context) {
    throw new Error("useDashboardShellState must be used within DashboardShellStateProvider.");
  }

  return context;
}
