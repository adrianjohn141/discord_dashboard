import { ArrowRightIcon, BrandMark, CaseIcon, DiscordIcon, PulseIcon, SettingsIcon, ShieldIcon } from "@/components/dashboard/icons";

import { DiscordSignInButton } from "./discord-sign-in-button";

interface DiscordAuthScreenProps {
  eyebrow: string;
  title: string;
  description: string;
}

const features = [
  {
    icon: CaseIcon,
    title: "Multi-guild command center",
    copy: "Switch between the servers you can manage without touching slash commands for every setting change.",
  },
  {
    icon: PulseIcon,
    title: "Moderation telemetry",
    copy: "Review warnings, logs, temporary actions, and bot presence from the shared Supabase runtime.",
  },
  {
    icon: SettingsIcon,
    title: "AutoMod controls",
    copy: "Tune anti-spam, anti-link, anti-invite, and anti-raid thresholds with server-side validation.",
  },
];

export function DiscordAuthScreen({
  eyebrow,
  title,
  description,
}: DiscordAuthScreenProps) {
  return (
    <main className="app-shell auth-shell flex items-center justify-center p-4 min-h-screen">
      <section className="auth-frame w-full max-w-[1100px] overflow-hidden rounded-[24px] grid lg:grid-cols-[400px_1fr]">
        <aside className="auth-showcase relative overflow-hidden p-6 lg:p-8 flex flex-col justify-center">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-surface-elevated)] border border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Akbash -1.png" alt="Akbash Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
                  Akbash Moderation
                </p>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Dashboard
                </h2>
              </div>
            </div>

            <div className="auth-illustration py-4">
              <div className="shield-shell !w-40 !h-40">
                <div className="shield-core !w-24 !h-24">
                  <DiscordIcon className="h-12 w-16 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--line)] flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{feature.title}</p>
                    <p className="text-xs leading-relaxed text-[var(--text-faint)]">{feature.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="auth-panel p-6 lg:p-10 flex flex-col justify-center bg-[var(--bg-surface)]">
          <div className="max-w-[460px]">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>

            <div className="mt-6">
              <DiscordSignInButton className="primary-button w-full py-3.5 text-sm font-bold" />
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-center text-[10px] text-[var(--text-faint)] uppercase tracking-widest font-bold">
                  OAuth2 Secure Access Only
                </p>
                <div className="flex gap-4 text-xs font-semibold text-[var(--text-muted)]">
                  <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                  <span className="text-[var(--line)]">&bull;</span>
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
