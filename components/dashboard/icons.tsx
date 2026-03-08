interface IconProps {
  className?: string;
}

function IconFrame({
  className,
  children,
  viewBox = "0 0 24 24",
}: IconProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function BrandMark({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={className ?? "h-12 w-12"}
      fill="none"
    >
      <path
        d="M24 5 6 37h8.8l9.2-16.6L33.2 37H42L24 5Z"
        fill="url(#brand-gradient)"
      />
      <path
        d="M16.3 37h15.4l-7.7-13.8L16.3 37Z"
        fill="rgba(240,244,255,0.9)"
      />
      <defs>
        <linearGradient id="brand-gradient" x1="6" x2="42" y1="5" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="#7CE7FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 24"
      className={className ?? "h-6 w-8"}
      fill="currentColor"
    >
      <path d="M26.63 2.53a23.2 23.2 0 0 0-5.87-1.8l-.28.57c-.34.7-.7 1.63-.97 2.36a21.25 21.25 0 0 0-7.05 0 24.22 24.22 0 0 0-.98-2.36l-.28-.57a23.17 23.17 0 0 0-5.87 1.8C1.61 8.14.69 13.62 1.12 19.02l.02.17a23.45 23.45 0 0 0 7.2 3.61l.59-1c.45-.77.84-1.58 1.17-2.43a14.98 14.98 0 0 1-1.84-.88l.46-.35.31-.26a16.95 16.95 0 0 0 13.95 0l.32.26.45.35c-.6.35-1.22.65-1.86.89.33.84.72 1.65 1.18 2.42l.58 1a23.3 23.3 0 0 0 7.21-3.61l.02-.17c.52-6.24-1.05-11.67-4.3-16.49ZM11.3 15.67c-1.37 0-2.5-1.28-2.5-2.85 0-1.58 1.1-2.86 2.5-2.86 1.4 0 2.53 1.29 2.5 2.86 0 1.57-1.12 2.85-2.5 2.85Zm9.4 0c-1.38 0-2.5-1.28-2.5-2.85 0-1.58 1.1-2.86 2.5-2.86 1.4 0 2.53 1.29 2.5 2.86 0 1.57-1.12 2.85-2.5 2.85Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </IconFrame>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </IconFrame>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M7.6 9A7 7 0 0 1 20 12" />
      <path d="M16.4 15A7 7 0 0 1 4 12" />
    </IconFrame>
  );
}

export function GuildsIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </IconFrame>
  );
}

export function OverviewIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 12h6v8H4z" />
      <path d="M14 4h6v16h-6z" />
    </IconFrame>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </IconFrame>
  );
}

export function AutomationIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 4v16" />
      <path d="M4 10h8" />
      <path d="M12 14h8" />
      <circle cx="7" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="14" r="2" fill="currentColor" stroke="none" />
    </IconFrame>
  );
}

export function LogsIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </IconFrame>
  );
}

export function TemporaryIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </IconFrame>
  );
}

export function CaseIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M6 6h10l2 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </IconFrame>
  );
}

export function BanIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 15.5 7-7" />
    </IconFrame>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 4 4 19h16L12 4Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </IconFrame>
  );
}

export function PulseIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </IconFrame>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 3 5 6v5c0 5 3.4 8.4 7 10 3.6-1.6 7-5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4" />
    </IconFrame>
  );
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconFrame>
  );
}

export function TerminalIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </IconFrame>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m6 9 6 6 6-6" />
    </IconFrame>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </IconFrame>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconFrame>
  );
}
