export type AutomationFieldName =
  | "antiAbuseTimeoutWarnings"
  | "antiAbuseTimeoutDuration"
  | "antiAbuseTempbanWarnings"
  | "antiAbuseTempbanDuration"
  | "antiAbuseBanWarnings"
  | "antiAbuseWindowDays";

export interface AutomationActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  formErrors: string[];
  fieldErrors: Partial<Record<AutomationFieldName, string[]>>;
}

export const initialAutomationActionState: AutomationActionState = {
  status: "idle",
  message: null,
  formErrors: [],
  fieldErrors: {},
};
