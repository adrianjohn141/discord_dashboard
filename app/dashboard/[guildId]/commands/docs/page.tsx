import { requireGuildAccess } from "@/lib/auth/guards";
import { BookIcon, TerminalIcon } from "@/components/dashboard/icons";
import Link from "next/link";

export default async function CustomCommandsDocsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await requireGuildAccess(guildId);

  return (
    <div className="space-y-6">
      <div className="table-panel p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--line)] text-[var(--primary)]">
              <BookIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
                Documentation
              </p>
              <h2 className="mt-1 text-3xl font-bold text-white tracking-tight">
                Custom Commands Guide
              </h2>
            </div>
          </div>
          <Link
            href={`/dashboard/${guildId}/commands`}
            className="secondary-button"
          >
            &larr; Back to Commands
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-base text-[var(--text-muted)] leading-relaxed">
          Learn how to use variables and create rich Discord embeds to make your custom commands more dynamic and visually appealing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="table-panel p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <TerminalIcon className="h-5 w-5 text-[var(--primary)]" />
              Available Variables
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Variables allow you to insert dynamic data into your command responses.
            </p>
            
            <div className="space-y-4">
              <div className="bg-[var(--bg-surface-elevated)] border border-[var(--line)] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg-surface)]">
                      <th className="p-3 font-bold text-[var(--text-faint)] uppercase tracking-wider text-xs">Variable</th>
                      <th className="p-3 font-bold text-[var(--text-faint)] uppercase tracking-wider text-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] text-[var(--text-muted)]">
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user}"} or {"{user.mention}"}</td>
                      <td className="p-3">Mentions the user who invoked the command.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.id}"}</td>
                      <td className="p-3">The Discord ID of the user.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.name}"}</td>
                      <td className="p-3">The username of the user.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.avatar}"}</td>
                      <td className="p-3">URL to the user's avatar image.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.created_at}"}</td>
                      <td className="p-3">Account creation date (Discord timestamp).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.joined_at}"}</td>
                      <td className="p-3">Server join date (Discord timestamp).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.color}"}</td>
                      <td className="p-3">User's highest role color hex code.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{user.top_role}"}</td>
                      <td className="p-3">User's highest role name.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server}"}</td>
                      <td className="p-3">The name of the current server.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.id}"}</td>
                      <td className="p-3">The Discord ID of the current server.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.member_count}"}</td>
                      <td className="p-3">Total number of members in the server.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.icon}"}</td>
                      <td className="p-3">URL to the server's icon image.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.owner_id}"}</td>
                      <td className="p-3">The Discord ID of the server owner.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.created_at}"}</td>
                      <td className="p-3">Server creation date (Discord timestamp).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{server.boost_count}"}</td>
                      <td className="p-3">Number of active server boosts.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{channel}"} or {"{channel.mention}"}</td>
                      <td className="p-3">Mentions the channel where the command was used.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{channel.id}"}</td>
                      <td className="p-3">The Discord ID of the current channel.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{channel.topic}"}</td>
                      <td className="p-3">The topic/description of the current channel.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{message.id}"}</td>
                      <td className="p-3">The Discord ID of the command message.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{message.link}"}</td>
                      <td className="p-3">Direct URL link to the command message.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{time}"}</td>
                      <td className="p-3">Current time (Discord timestamp format).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{date}"}</td>
                      <td className="p-3">Current date (Discord timestamp format).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{timestamp}"}</td>
                      <td className="p-3">Current Unix timestamp.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{args}"}</td>
                      <td className="p-3">All text written after the command name.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-white">{"{arg:1}"}, {"{arg:2}"}</td>
                      <td className="p-3">Specific words after the command (e.g., {"{arg:1}"} gets the first word).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="table-panel p-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <BookIcon className="h-5 w-5 text-[var(--primary)]" />
              Creating Embeds
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              When you toggle <strong>"Send as Embed"</strong>, the bot expects your response text to be formatted as a valid JSON object. This allows you to create rich, visually striking messages.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-2">Basic Embed Structure</h4>
                <div className="bg-[var(--bg-input)] border border-[var(--line)] rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-[var(--primary)]">
{`{
  "title": "Welcome to {server}!",
  "description": "Hello {user}, please read the rules.",
  "color": 5814783
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2">Advanced Embed Example</h4>
                <div className="bg-[var(--bg-input)] border border-[var(--line)] rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-[var(--primary)]">
{`{
  "title": "User Information",
  "description": "Here is the requested data for {user}",
  "color": 16711680,
  "thumbnail": {
    "url": "{user.avatar}"
  },
  "fields": [
    {
      "name": "Username",
      "value": "{user.name}",
      "inline": true
    },
    {
      "name": "User ID",
      "value": "{user.id}",
      "inline": true
    }
  ],
  "footer": {
    "text": "Server Members: {server.member_count}",
    "icon_url": "{server.icon}"
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-400">
                  <strong>Pro Tip:</strong> You can use a tool like <a href="https://discohook.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Discohook</a> to visually design your embed and copy the JSON into the dashboard! Note: We only support standard Embed fields.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
