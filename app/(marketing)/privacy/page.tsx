export const metadata = {
  title: "Privacy Policy | Akbash",
  description: "Privacy Policy for the Akbash Discord Moderation Bot.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto table-panel p-8 md:p-12 space-y-8">
        <div className="border-b border-[var(--line)] pb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-[var(--text-muted)]">Last updated: March 10, 2026</p>
        </div>

        <div className="space-y-8 text-[var(--text-muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Akbash. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Discord Moderation Bot and accompanying web dashboard ("the Service").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="mb-4">
              To provide effective moderation and logging capabilities, the Service collects and processes the following data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Discord Account Information:</strong> User IDs, usernames, and avatars of members interacting with the bot or logging into the dashboard.</li>
              <li><strong>Server Information:</strong> Guild IDs, server names, roles, channel structures, and configuration settings necessary for bot operations.</li>
              <li><strong>Message Content:</strong> For the purpose of AutoMod, anti-spam, and anti-link filtering, message content is temporarily processed in memory. We do not permanently store message contents unless a message is flagged and logged as part of a specific server moderation action (e.g., in a mod log or audit log configured by the server administrator).</li>
              <li><strong>Audit Logs:</strong> Records of moderation actions (bans, kicks, warnings, timeouts) and dashboard configuration changes made by server administrators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our moderation features and dashboard.</li>
              <li>To enforce server-specific rules (e.g., auto-deleting links or applying temporary roles/bans).</li>
              <li>To provide server administrators with historical moderation logs and analytics.</li>
              <li>To improve and optimize the performance and stability of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. Data collected by the bot (such as moderation logs) is strictly isolated and only accessible to the authorized administrators and moderators of the specific Discord server where the data was generated. We may disclose information if required to do so by law or in response to valid requests by public authorities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention and Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, utilizing secure database infrastructure (Supabase) with strict Row Level Security (RLS) policies. Moderation data, including warnings and temporary action records, is retained as long as the bot remains configured to do so by the server administrator, or until the bot is removed from the server, at which point automated cleanup processes may purge the data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Data Rights</h2>
            <p>
              If you wish to have your data removed from our systems, you can request your server administrator to delete your moderation records via the dashboard or bot commands. If you are a server administrator and wish to delete all data associated with your server, simply kicking the bot and revoking its OAuth2 access will initiate the data purging process. For direct data inquiries, please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please reach out to us through our official support Discord server.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
