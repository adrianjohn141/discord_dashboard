# Discord Moderation Dashboard

Next.js 16 dashboard for managing Discord guild moderation data stored in Supabase.

This app is tightly coupled to the shared schema used by `discord_bot`, including moderation case records, automation settings, temporary actions, custom commands, and appeals review.

## Session Changes (2026-03-12)

- Added built-in command toggle management in `/dashboard/[guildId]/commands`.
- Added dedicated API route for built-in command toggles:
  - `GET /api/guilds/[guildId]/builtin-commands`
  - `PATCH /api/guilds/[guildId]/builtin-commands`
- Added built-in toggle query support backed by `dashboard_builtin_command_toggles_v`.
- Added command-name registry exports and toggle map typing for validation and defaults.
- Added optimistic per-command on/off UI controls in the built-in commands list.

## Session Changes (2026-03-11)

- Migrated dashboard reads to canonical moderation case records (`dashboard_moderation_cases_v`) with real case IDs.
- Added appeals support end-to-end:
  - New guild route: `/dashboard/[guildId]/appeals`
  - Staff accept/deny flow with decision notes
  - Review queue on guild overview now uses pending appeals
- Added dashboard data support for `dashboard_appeals_v`:
  - New `AppealRecord` type
  - New summary fields: `pendingAppealCount`, `latestAppeals`
  - New cached query: `getGuildAppeals`
- Added server action to decide appeals:
  - updates `appeals` status
  - logs audit entries
  - writes a moderation decision case (`appeal_accept` / `appeal_deny`)
  - revalidates summary/logs/appeals cache tags
- Hardened accepted-appeal reversal behavior:
  - uses string-safe IDs from `dashboard_appeals_v` to avoid snowflake truncation
  - blocks acceptance when Discord reversal fails (including `404`)
  - sends a user DM for accepted appeals (matching bot command behavior, including server ID)
- Added random public moderation/appeal references in dashboard data and UI:
  - case labels now prefer `case_ref` (`C...`)
  - appeal labels now prefer `appeal_ref` (`A...`)
  - appeal decision actions resolve records by `appeal_ref` with legacy numeric fallback
- Added compatibility fallback behavior when `dashboard_appeals_v` is not yet present in schema cache.
- Extended guild settings to support `appeal_channel_id` configuration for appeal workflow routing.

## Main Features

- Guild-scoped moderation overview with case-driven metrics and recent activity.
- Moderation case logs with filters.
- Temporary actions view (temporary bans/roles, role locks).
- Automation controls (anti-spam/link/invite/raid and escalation policy).
- Guild settings (log channel, appeal channel, mute role, autorole).
- Custom commands management.
- Built-in command toggles (per-command on or off) with bot-enforced behavior.
- Feedback board.
- Appeals review and decision workflow.

## Important Routes

- `/dashboard` guild list
- `/dashboard/[guildId]` overview
- `/dashboard/[guildId]/automation`
- `/dashboard/[guildId]/settings`
- `/dashboard/[guildId]/logs`
- `/dashboard/[guildId]/temporary-actions`
- `/dashboard/[guildId]/commands`
- `/dashboard/[guildId]/appeals`
- `/dashboard/feedback`

## API / Server Actions

- API routes under `app/api/*` for custom commands, feedback, and status.
- Server actions under route folders for settings, automation, and appeals decisions.

## Requirements

- Node.js 20+
- npm
- Supabase project with the latest schema from `discord_bot/database/migrations/schema.sql`

## Environment Variables

Create `.env` in this project with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DISCORD_BOT_TOKEN=your-discord-bot-token
# optional fallback:
DISCORD_TOKEN=your-discord-bot-token
```

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Build Note

`npm run typecheck` passes in this environment.

`npm run build` may fail in restricted network environments when fetching Google Fonts (`next/font`), even when application code is valid.

Accepted ban/timeout appeals from dashboard require a bot token on the dashboard server. The app checks `DISCORD_BOT_TOKEN` first, then `DISCORD_TOKEN` as fallback.
