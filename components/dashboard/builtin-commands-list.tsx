"use client";

import { useEffect, useState } from "react";
import { BUILTIN_COMMANDS } from "@/lib/dashboard/builtin-commands";
import {
  ShieldIcon,
  CaseIcon,
  MessageSquareIcon,
  SettingsIcon,
  TerminalIcon,
  BookIcon,
  ChevronDownIcon,
} from "./icons";
import type { BuiltInCommandToggleMap } from "@/types/dashboard";

const CATEGORY_ICONS: Record<string, any> = {
  "Moderation": CaseIcon,
  "MessageModeration": MessageSquareIcon,
  "RoleModeration": SettingsIcon,
  "AntiAbuse": ShieldIcon,
  "Appeals": BookIcon,
  "BotHelp": TerminalIcon,
};

interface BuiltInCommandsListProps {
  guildId: string;
  initialToggleMap: BuiltInCommandToggleMap;
}

function resolveCommandEnabled(toggleMap: BuiltInCommandToggleMap, commandName: string) {
  return toggleMap[commandName.toLowerCase()] ?? true;
}

export default function BuiltInCommandsList({
  guildId,
  initialToggleMap,
}: BuiltInCommandsListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    BUILTIN_COMMANDS.map((category) => category.id),
  );
  const [toggleMap, setToggleMap] = useState<BuiltInCommandToggleMap>(initialToggleMap);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToggleMap(initialToggleMap);
    setSavingMap({});
    setError(null);
  }, [initialToggleMap]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id],
    );
  };

  const toggleCommand = async (commandName: string) => {
    const normalizedName = commandName.toLowerCase();
    const currentValue = resolveCommandEnabled(toggleMap, normalizedName);
    const nextValue = !currentValue;

    setError(null);
    setToggleMap((prev) => ({
      ...prev,
      [normalizedName]: nextValue,
    }));
    setSavingMap((prev) => ({
      ...prev,
      [normalizedName]: true,
    }));

    try {
      const response = await fetch(`/api/guilds/${guildId}/builtin-commands`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commandName: normalizedName,
          enabled: nextValue,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to update command toggle.");
      }
    } catch (toggleError) {
      setToggleMap((prev) => ({
        ...prev,
        [normalizedName]: currentValue,
      }));
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update command toggle.",
      );
    } finally {
      setSavingMap((prev) => {
        const next = { ...prev };
        delete next[normalizedName];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Built-in Commands</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Core bot commands available on this server. Disable any command to block it for all members.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}

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
                  className={`h-5 w-5 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--line)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--line)] border-b border-[var(--line)] last:border-b-0">
                    {category.commands.map((command) => {
                      const normalizedName = command.name.toLowerCase();
                      const enabled = resolveCommandEnabled(toggleMap, normalizedName);
                      const isSaving = Boolean(savingMap[normalizedName]);

                      return (
                        <div
                          key={command.name}
                          className="p-4 hover:bg-[var(--bg-surface-elevated)]/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <code
                                className={`font-bold ${enabled ? "text-[var(--primary)]" : "text-[var(--text-faint)]"}`}
                              >
                                /{command.name}
                              </code>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {command.adminOnly && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Admin Only
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                    enabled
                                      ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
                                      : "text-rose-300 border-rose-500/20 bg-rose-500/10"
                                  }`}
                                >
                                  {enabled ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCommand(command.name)}
                              disabled={isSaving}
                              aria-label={`Toggle /${command.name}`}
                              aria-pressed={enabled}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                enabled ? "bg-emerald-500/80" : "bg-[var(--line)]"
                              } ${isSaving ? "cursor-not-allowed opacity-60" : ""}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  enabled ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                          <p
                            className={`mt-3 text-sm leading-relaxed transition-colors ${
                              enabled
                                ? "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                                : "text-[var(--text-faint)]"
                            }`}
                          >
                            {command.description}
                          </p>
                        </div>
                      );
                    })}
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
