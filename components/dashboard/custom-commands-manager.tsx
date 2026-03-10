"use client";

import { useEffect, useState } from "react";

import {
  LoaderIcon,
  PencilIcon,
  PlusIcon,
  TerminalIcon,
  TrashIcon,
  XIcon,
} from "@/components/dashboard/icons";
import type { CustomCommandRecord } from "@/types/dashboard";

interface CustomCommandsManagerProps {
  guildId: string;
  initialCommands: CustomCommandRecord[];
}

function mapCommandResponse(data: unknown): CustomCommandRecord[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((command) => {
    const row = command as Record<string, unknown>;

    return {
      id: String(row.id),
      guildId: String(row.guild_id),
      name: String(row.name),
      response: String(row.response),
      adminOnly: Boolean(row.admin_only),
      isEmbed: Boolean(row.is_embed),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  });
}

export default function CustomCommandsManager({
  guildId,
  initialCommands,
}: CustomCommandsManagerProps) {
  const [commands, setCommands] = useState<CustomCommandRecord[]>(initialCommands);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CustomCommandRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    response: "",
    adminOnly: false,
    isEmbed: false,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [commandToDelete, setCommandToDelete] = useState<string | null>(null);

  useEffect(() => {
    setCommands(initialCommands);
  }, [initialCommands]);

  const fetchCommands = async () => {
    try {
      const response = await fetch(`/api/guilds/${guildId}/commands`);
      const data = await response.json();
      setCommands(mapCommandResponse(data));
    } catch (error) {
      console.error("Failed to fetch commands:", error);
    }
  };

  const handleOpenModal = (command?: CustomCommandRecord) => {
    if (command) {
      setEditingCommand(command);
      setFormData({
        name: command.name,
        response: command.response,
        adminOnly: command.adminOnly,
        isEmbed: command.isEmbed,
      });
    } else {
      setEditingCommand(null);
      setFormData({ name: "", response: "", adminOnly: false, isEmbed: false });
    }

    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCommand(null);
    setFormData({ name: "", response: "", adminOnly: false, isEmbed: false });
    setErrorMsg(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.response) {
      return;
    }

    setErrorMsg(null);

    if (formData.isEmbed) {
      try {
        JSON.parse(formData.response);
      } catch {
        setErrorMsg("Invalid embed format. Please provide valid JSON.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/guilds/${guildId}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setErrorMsg(data?.error ?? "Failed to save command.");
        return;
      }

      await fetchCommands();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save command:", error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!commandToDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/guilds/${guildId}/commands?name=${commandToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCommands((current) => current.filter((command) => command.name !== commandToDelete));
      }
    } catch (error) {
      console.error("Failed to delete command:", error);
    } finally {
      setCommandToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white">Custom Commands</h2>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="primary-button flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create New Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="table-panel flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-surface-elevated)]">
            <TerminalIcon className="h-8 w-8 text-[var(--text-faint)]" />
          </div>
          <h3 className="text-xl font-bold text-white">No custom commands</h3>
          <p className="mt-2 max-w-sm text-[var(--text-muted)]">
            You have not created any custom commands for this server yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {commands.map((command) => (
            <div
              key={command.id}
              className="table-panel p-5 transition-colors hover:border-[var(--primary)]/30"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-2 text-[var(--primary)]">
                    <span className="font-bold">!</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-white">{command.name}</h4>
                      {command.adminOnly ? (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                          Admin Only
                        </span>
                      ) : null}
                      {command.isEmbed ? (
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          Embed
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 max-w-2xl break-words text-sm text-[var(--text-faint)]">
                      {command.response}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(command)}
                    className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-white"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommandToDelete(command.name)}
                    className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
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
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--line)] p-6">
              <h3 className="text-xl font-bold text-white">
                {editingCommand ? "Edit Command" : "Create New Command"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[var(--text-faint)] hover:text-white"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              <form id="custom-command-form" onSubmit={handleSubmit} className="space-y-6">
                {errorMsg ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-400">
                    Warning: {errorMsg}
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-faint)]">
                    Command Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-faint)]">
                      !
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          name: event.target.value.replace(/[^a-zA-Z0-9-]/g, ""),
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-input)] py-3 pl-8 pr-4 text-white placeholder-[var(--text-faint)] transition-colors focus:border-[var(--primary)] focus:outline-none"
                      placeholder="hello"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-faint)]">
                    Letters, numbers, and dashes only.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-faint)]">
                    Response Text
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.response}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, response: event.target.value }))
                    }
                    className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg-input)] px-4 py-3 font-mono text-sm text-white placeholder-[var(--text-faint)] transition-colors focus:border-[var(--primary)] focus:outline-none"
                    placeholder={
                      formData.isEmbed
                        ? '{\n  "title": "Hello {user.name}!",\n  "description": "Welcome to {server}"\n}'
                        : "Hello {user}! Welcome to the server."
                    }
                  />
                  <div className="custom-scrollbar mt-3 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-2">
                    {[
                      "{user}",
                      "{user.id}",
                      "{user.name}",
                      "{user.avatar}",
                      "{user.created_at}",
                      "{user.joined_at}",
                      "{user.color}",
                      "{user.top_role}",
                      "{server}",
                      "{server.id}",
                      "{server.member_count}",
                      "{server.icon}",
                      "{server.owner_id}",
                      "{server.created_at}",
                      "{server.boost_count}",
                      "{channel}",
                      "{channel.id}",
                      "{channel.topic}",
                      "{message.id}",
                      "{message.link}",
                      "{time}",
                      "{date}",
                      "{timestamp}",
                      "{args}",
                      "{arg:1}",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setFormData((current) => ({
                            ...current,
                            response: current.response + tag,
                          }))
                        }
                        className="rounded border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-2 py-1 text-[10px] text-[var(--text-faint)] transition-colors hover:border-[var(--primary)] hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Admin Only</h4>
                      <p className="mt-0.5 text-xs text-[var(--text-faint)]">
                        Restrict this command to server administrators.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          adminOnly: !current.adminOnly,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.adminOnly ? "bg-[var(--primary)]" : "bg-[var(--line)]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          formData.adminOnly ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Send as Embed</h4>
                      <p className="mt-0.5 text-xs text-[var(--text-faint)]">
                        Treat the response text as JSON for a rich embed.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({ ...current, isEmbed: !current.isEmbed }));
                        setErrorMsg(null);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isEmbed ? "bg-[var(--primary)]" : "bg-[var(--line)]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          formData.isEmbed ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-[var(--line)] bg-[var(--bg-surface)] p-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-4 py-3 font-bold text-white transition-colors hover:bg-[var(--line)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="custom-command-form"
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : null}
                {editingCommand ? "Update Command" : "Create Command"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {commandToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <TrashIcon className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Delete Command</h3>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Are you sure you want to delete the command{" "}
              <strong className="text-white">!{commandToDelete}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCommandToDelete(null)}
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] px-4 py-2.5 font-bold text-white transition-colors hover:bg-[var(--line)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
