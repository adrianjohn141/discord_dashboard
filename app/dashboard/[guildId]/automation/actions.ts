"use server";

import { requireGuildAccess } from "@/lib/auth/guards";
import { getGuildConfig } from "@/lib/db/queries";
import {
  automationPayloadSchema,
  updateAntiAbusePolicy,
} from "@/lib/db/mutations";

import type { AutomationActionState } from "./automation-form-state";

function buildAutomationPayload(formData: FormData) {
  const guildId = String(formData.get("guildId") ?? "");

  return {
    guildId,
    antispam: formData.get("antispam") === "on",
    antilink: formData.get("antilink") === "on",
    antiinvite: formData.get("antiinvite") === "on",
    antiraid: formData.get("antiraid") === "on",
    antiAbuseTimeoutWarnings: formData.get("antiAbuseTimeoutWarnings"),
    antiAbuseTimeoutDuration: formData.get("antiAbuseTimeoutDuration"),
    antiAbuseTempbanWarnings: formData.get("antiAbuseTempbanWarnings"),
    antiAbuseTempbanDuration: formData.get("antiAbuseTempbanDuration"),
    antiAbuseBanWarnings: formData.get("antiAbuseBanWarnings"),
    antiAbuseWindowDays: formData.get("antiAbuseWindowDays"),
  };
}

export async function updateAutomationAction(
  _previousState: AutomationActionState,
  formData: FormData,
): Promise<AutomationActionState> {
  const payload = buildAutomationPayload(formData);
  const { user } = await requireGuildAccess(payload.guildId);
  const parsed = automationPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldErrors = flattened.fieldErrors as AutomationActionState["fieldErrors"];
    const messages = [
      ...flattened.formErrors,
      ...Object.values(fieldErrors).flatMap((value) => value ?? []),
    ];

    return {
      status: "error",
      message: messages[0] ?? "Could not save the automation policy.",
      formErrors: flattened.formErrors,
      fieldErrors,
    };
  }

  const existingConfig = await getGuildConfig(parsed.data.guildId);

  await updateAntiAbusePolicy(user.id, parsed.data, existingConfig);

  return {
    status: "success",
    message: "Automation policy saved.",
    formErrors: [],
    fieldErrors: {},
  };
}
