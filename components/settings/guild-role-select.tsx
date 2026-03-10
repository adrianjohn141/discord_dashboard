import type { GuildRoleOption } from "@/types/dashboard";

import { ManualSnowflakeInput } from "./manual-snowflake-input";
import { ResourceDropdown, type ResourceDropdownItem } from "./resource-dropdown";

interface GuildRoleSelectProps {
  name: string;
  label: string;
  defaultValue: string | null;
  roles: GuildRoleOption[];
  fallbackMessage: string;
}

export function GuildRoleSelect({
  name,
  label,
  defaultValue,
  roles,
  fallbackMessage,
}: GuildRoleSelectProps) {
  if (roles.length === 0) {
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

  const syncedRoles = [...roles]
    .filter((role) => !role.isDefault)
    .sort((left, right) => {
      if (left.position !== right.position) {
        return right.position - left.position;
      }

      return left.name.localeCompare(right.name);
    });

  const items: ResourceDropdownItem[] = syncedRoles.map((role) => ({
    value: role.roleId,
    label: role.name,
    selectable: !role.managed && role.botAssignable,
    reason: role.managed
      ? "Managed by Discord or an integration"
      : role.botAssignable
        ? undefined
        : "Bot cannot assign this role with its current permissions or role order",
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
      helperText="Synced roles stay visible. Roles the bot cannot assign are disabled."
      placeholder="Not configured"
      emptyMessage="No synced roles are available."
    />
  );
}
