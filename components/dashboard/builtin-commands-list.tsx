"use client";

import { useState } from "react";
import { BUILTIN_COMMANDS } from "@/lib/dashboard/builtin-commands";
import { 
  ShieldIcon, 
  CaseIcon, 
  MessageSquareIcon, 
  SettingsIcon, 
  TerminalIcon,
  ChevronDownIcon
} from "./icons";
import { BuiltInCommand, BuiltInCommandCategory } from "@/types/dashboard";

const CATEGORY_ICONS: Record<string, any> = {
  "Moderation": CaseIcon,
  "MessageModeration": MessageSquareIcon,
  "RoleModeration": SettingsIcon,
  "AntiAbuse": ShieldIcon,
  "BotHelp": TerminalIcon,
};

export default function BuiltInCommandsList() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    BUILTIN_COMMANDS.map(c => c.id)
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Built-in Commands</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Core bot commands available across all servers.
        </p>
      </div>

      <div className="grid gap-4">
        {BUILTIN_COMMANDS.map((category) => {
          const Icon = CATEGORY_ICONS[category.id] || TerminalIcon;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div 
              key={category.id} 
              className="table-panel overflow-hidden border border-[var(--line)] bg-[var(--bg-surface)]"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-surface-elevated)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--line)] text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-white">{category.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--line)] text-[var(--text-muted)]">
                    {category.commands.length}
                  </span>
                </div>
                <ChevronDownIcon 
                  className={`h-5 w-5 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--line)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--line)] border-b border-[var(--line)] last:border-b-0">
                    {category.commands.map((command) => (
                      <div 
                        key={command.name} 
                        className="p-4 hover:bg-[var(--bg-surface-elevated)]/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <code className="text-[var(--primary)] font-bold">/{command.name}</code>
                          {command.adminOnly && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Admin Only
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text)] transition-colors">
                          {command.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
