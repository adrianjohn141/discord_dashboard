"use client";

import { useEffect, useState } from "react";

import {
  LoaderIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "@/components/dashboard/icons";
import type { FeedbackRecord } from "@/types/dashboard";

interface FeedbackBoardProps {
  isAdmin: boolean;
  initialFeedback: FeedbackRecord[];
}

export function FeedbackBoard({ isAdmin, initialFeedback }: FeedbackBoardProps) {
  const [feedbacks, setFeedback] = useState<FeedbackRecord[]>(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        setFeedback(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = (feedback?: FeedbackRecord) => {
    if (feedback) {
      setEditingId(feedback.id);
      setFeedbackContent(feedback.content);
    } else {
      setEditingId(null);
      setFeedbackContent("");
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFeedbackContent("");
  };

  const handleSubmitFeedback = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!feedbackContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        const response = await fetch(`/api/feedback/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: feedbackContent }),
        });

        if (response.ok) {
          handleCloseModal();
          await fetchFeedback();
        }
      } else {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: feedbackContent }),
        });

        if (response.ok) {
          handleCloseModal();
          await fetchFeedback();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackToDelete}`, { method: "DELETE" });

      if (response.ok) {
        setFeedback((current) => current.filter((feedback) => feedback.id !== feedbackToDelete));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFeedbackToDelete(null);
    }
  };

  const toggleStar = async (feedbackId: string) => {
    setFeedback((current) =>
      current.map((feedback) => {
        if (feedback.id !== feedbackId) {
          return feedback;
        }

        return {
          ...feedback,
          hasStarred: !feedback.hasStarred,
          starsCount: feedback.hasStarred ? feedback.starsCount - 1 : feedback.starsCount + 1,
        };
      }),
    );

    try {
      await fetch(`/api/feedback/${feedbackId}/star`, { method: "POST" });
    } catch (error) {
      console.error(error);
      await fetchFeedback();
    }
  };

  const markAsDone = async (feedbackId: string) => {
    if (!isAdmin) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, { method: "PATCH" });
      if (response.ok) {
        setFeedback((current) =>
          current.map((feedback) =>
            feedback.id === feedbackId ? { ...feedback, status: "done" } : feedback,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (feedbackId: string) => {
    const content = commentInputs[feedbackId];

    if (!content?.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setCommentInputs((current) => ({ ...current, [feedbackId]: "" }));
        await fetchFeedback();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white">Community Feedback</h2>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="primary-button flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Submit Feedback
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="table-panel p-8 text-center">
          <h3 className="text-xl font-bold text-white">No feedback yet</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Start the conversation with a bug report, question, or feature request.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {feedbacks.map((item) => (
            <div key={item.id} className="table-panel flex flex-col justify-between p-5">
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "done"
                        ? "border-green-500/20 bg-green-500/10 text-green-400"
                        : "border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]"
                    }`}
                  >
                    {item.status}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && item.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => markAsDone(item.id)}
                        className="text-xs text-[var(--text-faint)] transition-colors hover:text-green-400"
                      >
                        Mark Done
                      </button>
                    ) : null}
                    {item.isAuthor || isAdmin ? (
                      <div className="ml-2 flex items-center gap-1">
                        {item.isAuthor ? (
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="rounded-md p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-white"
                            title="Edit your feedback"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setFeedbackToDelete(item.id)}
                          className="rounded-md p-1.5 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title={isAdmin && !item.isAuthor ? "Delete (Admin)" : "Delete your feedback"}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-white">
                  {item.content}
                </p>
              </div>

              <div className="mt-auto space-y-4">
                {item.comments?.length ? (
                  <div className="space-y-3 border-t border-[var(--line)] pt-4">
                    {item.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="relative overflow-hidden rounded-lg bg-[var(--bg-input)] p-3"
                      >
                        <div
                          className={`absolute left-0 top-0 h-full w-1 ${
                            comment.isAdmin ? "bg-[var(--primary)]" : "bg-[var(--line)]"
                          }`}
                        />
                        <p
                          className={`mb-1 text-xs font-bold ${
                            comment.isAdmin ? "text-[var(--primary)]" : "text-white"
                          }`}
                        >
                          {comment.isAdmin ? "Admin Response" : "User Reply"}
                        </p>
                        <p className="whitespace-pre-wrap text-xs text-[var(--text-muted)]">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                  <p className="text-xs text-[var(--text-faint)]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleStar(item.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors ${
                      item.hasStarred
                        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                        : "border-[var(--line)] bg-[var(--bg-surface-elevated)] text-[var(--text-faint)] hover:text-white"
                    }`}
                  >
                    <StarIcon className={`h-4 w-4 ${item.hasStarred ? "fill-current" : ""}`} />
                    <span className="text-xs font-bold">{item.starsCount}</span>
                  </button>
                </div>

                <div className="mt-2 flex gap-2 border-t border-[var(--line)] pt-4">
                  <input
                    type="text"
                    placeholder={isAdmin ? "Admin reply..." : "Add a reply..."}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs text-white placeholder-[var(--text-faint)] focus:border-[var(--primary)] focus:outline-none"
                    value={commentInputs[item.id] || ""}
                    onChange={(event) =>
                      setCommentInputs((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleCommentSubmit(item.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCommentSubmit(item.id)}
                    className="rounded-lg bg-[var(--primary)] p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    disabled={!commentInputs[item.id]?.trim()}
                  >
                    <MessageSquareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] p-6">
              <h3 className="text-xl font-bold text-white">
                {editingId ? "Edit Feedback" : "Submit Feedback"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[var(--text-faint)] hover:text-white"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitFeedback} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-faint)]">
                  Your Feedback / Question
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedbackContent}
                  onChange={(event) => setFeedbackContent(event.target.value)}
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg-input)] px-4 py-3 text-white placeholder-[var(--text-faint)] transition-colors focus:border-[var(--primary)] focus:outline-none"
                  placeholder="I think the bot should have..."
                />
                <p className="mt-2 text-xs text-[var(--text-faint)]">
                  Feedback is submitted anonymously.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-4 py-3 font-bold text-white transition-colors hover:bg-[var(--line)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <LoaderIcon className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Save Changes" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {feedbackToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <TrashIcon className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Delete Feedback</h3>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Are you sure you want to delete this feedback post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeedbackToDelete(null)}
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-4 py-2.5 font-bold text-white transition-colors hover:bg-[var(--line)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFeedback}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
