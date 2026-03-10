import { FeedbackBoard } from "@/components/dashboard/feedback-board";
import { isGlobalAdmin } from "@/lib/auth/guards";
import { getDashboardRequestContext } from "@/lib/dashboard/request-context";
import { getFeedbackRecords } from "@/lib/db/queries";

export default async function FeedbackPage() {
  const { user } = await getDashboardRequestContext();
  const [feedback, isAdmin] = await Promise.all([
    getFeedbackRecords(user.id),
    Promise.resolve(isGlobalAdmin(user)),
  ]);

  return (
    <div className="space-y-6">
      <div className="table-panel p-6 md:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
            Feedback & Questions
          </p>
          <h2 className="mt-1 text-3xl font-bold text-white tracking-tight">
            Community Board
          </h2>
        </div>
        <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] leading-relaxed">
          Have an idea, found a bug, or just have a question about Akbash? Let us know below! 
          Feedback is submitted anonymously, and you can star posts you agree with.
        </p>
      </div>

      <FeedbackBoard isAdmin={isAdmin} initialFeedback={feedback} />
    </div>
  );
}
