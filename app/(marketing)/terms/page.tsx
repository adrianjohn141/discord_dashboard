export const metadata = {
  title: "Terms of Service | Akbash",
  description: "Terms of Service for the Akbash Discord Moderation Bot.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto table-panel p-8 md:p-12 space-y-8">
        <div className="border-b border-[var(--line)] pb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-[var(--text-muted)]">Last updated: March 10, 2026</p>
        </div>

        <div className="space-y-8 text-[var(--text-muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By adding the Akbash Discord Moderation Bot ("the Service") to your Discord server or accessing our dashboard, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service and remove the bot from your server.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Akbash provides automated moderation, logging, and guild management tools for Discord communities. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Conduct</h2>
            <p className="mb-4">
              You are responsible for all activities that occur under your server's use of the Service. You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable local, state, national, or international law.</li>
              <li>Violate the Discord Terms of Service or Community Guidelines.</li>
              <li>Attempt to bypass, exploit, or disrupt the bot's infrastructure, rate limits, or security measures.</li>
              <li>Use the bot to facilitate harassment, spam, or malicious behavior towards users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data and Privacy</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information in connection with the Service is described in our <a href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</a>. By using the Service, you grant us permission to process message contents, user IDs, and server configurations as necessary to provide moderation functions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind. In no event shall the creators or operators of Akbash be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or server integrity, arising out of your use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us through our official support Discord server.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
