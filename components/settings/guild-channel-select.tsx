import type { GuildChannelOption } from "@/types/dashboard";

import { ManualSnowflakeInput } from "./manual-snowflake-input";
import { ResourceDropdown, type ResourceDropdownItem } from "./resource-dropdown";

interface GuildChannelSelectProps {
  name: string;
  label: string;
  defaultValue: string | null;
  channels: GuildChannelOption[];
  fallbackMessage: string;
}

export function GuildChannelSelect({
  name,
  label,
  defaultValue,
  channels,
  fallbackMessage,
}: GuildChannelSelectProps) {
  if (channels.length === 0) {
    return (
      <ManualSnowflakeInput
        name={name}
        label={label}
        defaultValue={defaultValue}
        placeholder="123456789012345678"
        helperText={fallbackMessage}
      />
    );
  }

  const syncedTextChannels = [...channels]
    .filter((channel) => channel.isTextLogCandidate)
    .sort((left, right) => {
      if (left.parentName !== right.parentName) {
        return (left.parentName ?? "").localeCompare(right.parentName ?? "");
      }

      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return left.name.localeCompare(right.name);
    });

  const items: ResourceDropdownItem[] = syncedTextChannels.map((channel) => ({
    value: channel.channelId,
    label: `#${channel.name}`,
    groupLabel: channel.parentName ?? undefined,
    selectable: channel.botCanSend,
    reason: channel.botCanSend ? undefined : "Bot cannot send messages in this channel",
  }));

  const hasCurrentSelection = defaultValue ? items.some((item) => item.value === defaultValue) : true;

  if (!hasCurrentSelection && defaultValue) {
    items.unshift({
      value: defaultValue,
      label: `Current selection unavailable (ID ${defaultValue})`,
      selectable: true,
      reason: "Saved selection is not in the synced catalog.",
      isCurrentUnavailable: true,
    });
  }

  return (
    <ResourceDropdown
      name={name}
      label={label}
      defaultValue={defaultValue}
      items={items}
      helperText="Only text and announcement channels are shown. Channels the bot cannot send to are disabled."
      placeholder="Not configured"
      emptyMessage="No synced text or announcement channels are available."
    />
  );
}
