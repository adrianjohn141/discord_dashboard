"use client";

import { useState, useEffect } from "react";
import { MessageSquareIcon, PlusIcon, StarIcon, CheckCircleIcon, SendIcon, LoaderIcon, PencilIcon, TrashIcon, XIcon } from "@/components/dashboard/icons";
import type { FeedbackRecord } from "@/types/dashboard";

interface FeedbackBoardProps {
  isAdmin: boolean;
}

export function FeedbackBoard({ isAdmin }: FeedbackBoardProps) {
  const [feedbacks, setFeedback] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState("");

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Edit existing
        const res = await fetch(`/api/feedback/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: feedbackContent }),
        });
        if (res.ok) {
          handleCloseModal();
          await fetchFeedback();
        }
      } else {
        // Create new
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: feedbackContent }),
        });
        if (res.ok) {
          handleCloseModal();
          await fetchFeedback();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    setFeedbackToDelete(feedbackId);
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    try {
      const res = await fetch(`/api/feedback/${feedbackToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback(prev => prev.filter(f => f.id !== feedbackToDelete));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackToDelete(null);
    }
  };

  const toggleStar = async (feedbackId: string) => {
    // Optimistic update
    setFeedback(prev => prev.map(f => {
      if (f.id === feedbackId) {
        return {
          ...f,
          hasStarred: !f.hasStarred,
          starsCount: f.hasStarred ? f.starsCount - 1 : f.starsCount + 1
        };
      }
      return f;
    }));

    try {
      await fetch(`/api/feedback/${feedbackId}/star`, { method: "POST" });
    } catch (err) {
      // Revert on error
      await fetchFeedback();
    }
  };

  const markAsDone = async (feedbackId: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/status`, { method: "PATCH" });
      if (res.ok) {
        setFeedback(prev => prev.map(f => f.id === feedbackId ? { ...f, status: "done" } : f));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (feedbackId: string) => {
    const content = commentInputs[feedbackId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [feedbackId]: "" }));
        await fetchFeedback();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderIcon className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Community Feedback</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="primary-button flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Submit Feedback
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {feedbacks.map((item) => (
          <div key={item.id} className="table-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0 ${
                  item.status === 'done' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                }`}>
                  {item.status}
                </div>
                
                <div className="flex items-center gap-2">
                  {isAdmin && item.status === 'open' && (
                    <button 
                      onClick={() => markAsDone(item.id)}
                      className="text-xs text-[var(--text-faint)] hover:text-green-400 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                  {(item.isAuthor || isAdmin) && (
                    <div className="flex items-center gap-1 ml-2">
                      {item.isAuthor && (
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-[var(--text-faint)] hover:text-white hover:bg-[var(--bg-surface-elevated)] rounded-md transition-colors"
                          title="Edit your feedback"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="p-1.5 text-[var(--text-faint)] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title={isAdmin && !item.isAuthor ? "Delete (Admin)" : "Delete your feedback"}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-white text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {item.content}
              </p>
            </div>

            <div className="space-y-4 mt-auto">
              {item.comments && item.comments.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[var(--line)]">
                  {item.comments.map(comment => (
                    <div key={comment.id} className="bg-[var(--bg-input)] rounded-lg p-3 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${comment.isAdmin ? 'bg-[var(--primary)]' : 'bg-[var(--line)]'}`}></div>
                      <p className={`text-xs font-bold mb-1 ${comment.isAdmin ? 'text-[var(--primary)]' : 'text-white'}`}>
                        {comment.isAdmin ? 'Admin Response' : 'User Reply'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
                <p className="text-xs text-[var(--text-faint)]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => toggleStar(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    item.hasStarred 
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" 
                      : "bg-[var(--bg-surface-elevated)] border-[var(--line)] text-[var(--text-faint)] hover:text-white"
                  }`}
                >
                  <StarIcon className={`h-4 w-4 ${item.hasStarred ? "fill-current" : ""}`} />
                  <span className="text-xs font-bold">{item.starsCount}</span>
                </button>
              </div>

              {/* Comment Input visible to all authenticated users */}
              <div className="flex gap-2 mt-2 pt-4 border-t border-[var(--line)]">
                <input 
                  type="text" 
                  placeholder={isAdmin ? "Admin reply..." : "Add a reply..."}
                  className="flex-1 bg-[var(--bg-input)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-white placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--primary)]"
                  value={commentInputs[item.id] || ""}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(item.id)}
                />
                <button 
                  onClick={() => handleCommentSubmit(item.id)}
                  className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={!commentInputs[item.id]?.trim()}
                >
                  <MessageSquareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--line)] flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingId ? "Edit Feedback" : "Submit Feedback"}</h3>
              <button onClick={handleCloseModal} className="text-[var(--text-faint)] hover:text-white">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-2">
                  Your Feedback / Question
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--line)] rounded-xl py-3 px-4 text-white placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  placeholder="I think the bot should have..."
                />
                <p className="mt-2 text-xs text-[var(--text-faint)]">Feedback is submitted anonymously.</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 bg-[var(--bg-surface-elevated)] text-white font-bold rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <LoaderIcon className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
              <TrashIcon className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Feedback</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Are you sure you want to delete this feedback post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeedbackToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-[var(--bg-surface-elevated)] text-white font-bold rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFeedback}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}