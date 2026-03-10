"use client";

import { useState, useEffect } from "react";
import { TerminalIcon, PlusIcon, TrashIcon, LoaderIcon, PencilIcon, XIcon } from "@/components/dashboard/icons";
import type { CustomCommandRecord } from "@/types/dashboard";

interface CustomCommandsManagerProps {
  guildId: string;
}

export default function CustomCommandsManager({ guildId }: CustomCommandsManagerProps) {
  const [commands, setCommands] = useState<CustomCommandRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CustomCommandRecord | null>(null);
  const [formData, setFormData] = useState({ name: "", response: "", adminOnly: false, isEmbed: false });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCommands();
  }, [guildId]);

  const fetchCommands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/commands`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Map snake_case to camelCase
        setCommands(data.map(cmd => ({
          ...cmd,
          adminOnly: cmd.admin_only,
          isEmbed: cmd.is_embed
        })));
      }
    } catch (err) {
      console.error("Failed to fetch commands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (command?: CustomCommandRecord) => {
    if (command) {
      setEditingCommand(command);
      setFormData({ name: command.name, response: command.response, adminOnly: command.adminOnly, isEmbed: command.isEmbed });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.response) return;
    setErrorMsg(null);

    if (formData.isEmbed) {
      try {
        JSON.parse(formData.response);
      } catch (err) {
        setErrorMsg("Invalid Embed format. Please provide a valid JSON object for the embed.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCommands();
        handleCloseModal();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to save command.");
      }
    } catch (err) {
      console.error("Failed to save command:", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the command !${name}?`)) return;

    try {
      const res = await fetch(`/api/guilds/${guildId}/commands?name=${name}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCommands(commands.filter((c) => c.name !== name));
      }
    } catch (err) {
      console.error("Failed to delete command:", err);
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
        <h2 className="text-xl font-bold text-white">Custom Commands</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="primary-button flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create New Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="table-panel min-h-[300px] flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-[var(--bg-surface-elevated)] rounded-full flex items-center justify-center mb-6 border border-[var(--line)]">
            <TerminalIcon className="h-8 w-8 text-[var(--text-faint)]" />
          </div>
          <h3 className="text-xl font-bold text-white">No custom commands</h3>
          <p className="mt-2 text-[var(--text-muted)] max-w-sm">
            You haven&apos;t created any custom commands for this server yet. 
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {commands.map((command) => (
            <div key={command.id} className="table-panel p-5 flex items-center justify-between hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--line)] text-[var(--primary)]">
                  <span className="font-bold">!</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-lg">{command.name}</h4>
                    {command.adminOnly && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                        Admin Only
                      </span>
                    )}
                    {command.isEmbed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                        Embed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-faint)] truncate max-w-md">
                    {command.response}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(command)}
                  className="p-2 hover:bg-[var(--bg-surface-elevated)] rounded-lg text-[var(--text-faint)] hover:text-white transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(command.name)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--text-faint)] hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--line)] flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                {editingCommand ? "Edit Command" : "Create New Command"}
              </h3>
              <button onClick={handleCloseModal} className="text-[var(--text-faint)] hover:text-white">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="custom-command-form" onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-2">
                    Command Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)] font-bold text-lg">!</span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z0-9-]/g, "") })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--line)] rounded-xl py-3 pl-8 pr-4 text-white placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      placeholder="hello"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-faint)]">Letters, numbers, and dashes only.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-2">
                    Response Text
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.response}
                    onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--line)] rounded-xl py-3 px-4 text-white placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none font-mono text-sm"
                    placeholder={formData.isEmbed ? '{\n  "title": "Hello {user.name}!",\n  "description": "Welcome to {server}"\n}' : "Hello {user}! Welcome to the server."}
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {[
                      { tag: "{user}", hint: "Mentions the user" },
                      { tag: "{user.id}", hint: "User's ID" },
                      { tag: "{user.name}", hint: "User's name" },
                      { tag: "{user.avatar}", hint: "User's avatar URL" },
                      { tag: "{user.created_at}", hint: "User account creation date" },
                      { tag: "{user.joined_at}", hint: "User server join date" },
                      { tag: "{user.color}", hint: "User's highest role color" },
                      { tag: "{user.top_role}", hint: "User's highest role name" },
                      { tag: "{server}", hint: "Server name" },
                      { tag: "{server.id}", hint: "Server ID" },
                      { tag: "{server.member_count}", hint: "Member count" },
                      { tag: "{server.icon}", hint: "Server icon URL" },
                      { tag: "{server.owner_id}", hint: "Server owner's ID" },
                      { tag: "{server.created_at}", hint: "Server creation date" },
                      { tag: "{server.boost_count}", hint: "Server boost count" },
                      { tag: "{channel}", hint: "Channel mention" },
                      { tag: "{channel.id}", hint: "Channel ID" },
                      { tag: "{channel.topic}", hint: "Channel topic" },
                      { tag: "{message.id}", hint: "Command message ID" },
                      { tag: "{message.link}", hint: "Link to command message" },
                      { tag: "{time}", hint: "Current time" },
                      { tag: "{date}", hint: "Current date" },
                      { tag: "{timestamp}", hint: "Current unix timestamp" },
                      { tag: "{args}", hint: "All arguments" },
                      { tag: "{arg:1}", hint: "1st argument" },
                    ].map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => setFormData({ ...formData, response: formData.response + v.tag })}
                        className="text-[10px] px-2 py-1 bg-[var(--bg-surface-elevated)] rounded border border-[var(--line)] text-[var(--text-faint)] hover:text-white hover:border-[var(--primary)] transition-colors"
                        title={v.hint}
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-surface-elevated)] border border-[var(--line)] rounded-xl">
                    <div>
                      <h4 className="text-sm font-bold text-white">Admin Only</h4>
                      <p className="text-xs text-[var(--text-faint)] mt-0.5">Restrict this command to server administrators.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, adminOnly: !formData.adminOnly })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        formData.adminOnly ? 'bg-[var(--primary)]' : 'bg-[var(--line)]'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.adminOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-surface-elevated)] border border-[var(--line)] rounded-xl">
                    <div>
                      <h4 className="text-sm font-bold text-white">Send as Embed</h4>
                      <p className="text-xs text-[var(--text-faint)] mt-0.5">Treat the response text as JSON for a rich embed.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, isEmbed: !formData.isEmbed });
                        setErrorMsg(null);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        formData.isEmbed ? 'bg-[var(--primary)]' : 'bg-[var(--line)]'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isEmbed ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    </div>
                    </div>
                    </form>
                    </div>

                    <div className="p-6 border-t border-[var(--line)] flex gap-3 flex-shrink-0 bg-[var(--bg-surface)]">              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-3 px-4 bg-[var(--bg-surface-elevated)] text-white font-bold rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="custom-command-form"
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <LoaderIcon className="h-4 w-4 animate-spin" />}
                {editingCommand ? "Update Command" : "Create Command"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
