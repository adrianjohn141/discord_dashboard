interface StatusPillProps {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  default: "border-[var(--line)] bg-white/[0.04] text-[var(--text-muted)]",
  success: "border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)]",
  warning: "border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export function StatusPill({
  children,
  tone = "default",
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
