"use client";

import { useActionState } from "react";

import type { GuildConfigRecord } from "@/types/dashboard";

import { updateAutomationAction } from "./actions";
import { initialAutomationActionState } from "./automation-form-state";

const automationToggles = [
  { name: "antispam", label: "Anti-Spam" },
  { name: "antilink", label: "Anti-Link" },
  { name: "antiinvite", label: "Anti-Invite" },
  { name: "antiraid", label: "Anti-Raid" },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-[var(--danger)]">{message}</p>;
}

export function AutomationForm({
  guildId,
  config,
}: {
  guildId: string;
  config: GuildConfigRecord;
}) {
  const [state, formAction, pending] = useActionState(
    updateAutomationAction,
    initialAutomationActionState,
  );

  return (
    <form action={formAction} className="table-panel rounded-[24px] p-5 md:p-6">
      <input type="hidden" name="guildId" value={guildId} />

      {state.status !== "idle" && state.message ? (
        <div
          className={
            state.status === "error"
              ? "mb-6 rounded-[20px] border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
              : "mb-6 rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
          }
        >
          <p>{state.message}</p>
          {state.formErrors.length > 1 ? (
            <ul className="mt-2 space-y-1">
              {state.formErrors.slice(1).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {automationToggles.map(({ name, label }) => (
          <label
            key={name}
            className="control-card flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-sm subtle-copy">
                Toggle the live database-backed rule for this guild.
              </p>
            </div>
            <input
              type="checkbox"
              name={name}
              defaultChecked={config[name]}
              className="h-5 w-5 accent-[var(--accent)]"
            />
          </label>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-white">Escalation Order</p>
        <p className="mt-2 text-sm subtle-copy">
          Thresholds must stay in ascending order: timeout &lt; temporary ban &lt;
          permanent ban.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Timeout Warning Threshold</span>
          <input
            name="antiAbuseTimeoutWarnings"
            type="number"
            min={1}
            step={1}
            defaultValue={config.antiAbuseTimeoutWarnings}
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseTimeoutWarnings?.[0]} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Timeout Duration</span>
          <input
            name="antiAbuseTimeoutDuration"
            defaultValue={config.antiAbuseTimeoutDuration}
            placeholder="30m"
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseTimeoutDuration?.[0]} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Temporary Ban Threshold</span>
          <input
            name="antiAbuseTempbanWarnings"
            type="number"
            min={2}
            step={1}
            defaultValue={config.antiAbuseTempbanWarnings}
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseTempbanWarnings?.[0]} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Temporary Ban Duration</span>
          <input
            name="antiAbuseTempbanDuration"
            defaultValue={config.antiAbuseTempbanDuration}
            placeholder="3d"
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseTempbanDuration?.[0]} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Permanent Ban Threshold</span>
          <input
            name="antiAbuseBanWarnings"
            type="number"
            min={3}
            step={1}
            defaultValue={config.antiAbuseBanWarnings}
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseBanWarnings?.[0]} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Strike Window (days)</span>
          <input
            name="antiAbuseWindowDays"
            type="number"
            min={1}
            step={1}
            defaultValue={config.antiAbuseWindowDays}
            className="control-input"
          />
          <FieldError message={state.fieldErrors.antiAbuseWindowDays?.[0]} />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="primary-button px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Automation Policy"}
        </button>
      </div>
    </form>
  );
}
