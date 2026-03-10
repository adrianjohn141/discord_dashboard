"use client";

import { useEffect, useState } from "react";
import { 
  PlusIcon, 
  TrashIcon, 
  XIcon, 
  ChevronDownIcon, 
  ChevronUpIcon 
} from "./icons";

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedData {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: EmbedField[];
}

export function EmbedPreview({ embed, hexColor }: { embed: EmbedData, hexColor: string }) {
  return (
    <div 
      className="mt-2 flex w-full max-w-[432px] overflow-hidden rounded-md bg-[#2B2D31]"
      style={{ borderLeft: `4px solid ${hexColor}` }}
    >
      <div className="flex-1 p-3">
        {/* Author Preview */}
        {embed.author?.name && (
          <div className="mb-2 flex items-center gap-2">
            {embed.author.icon_url && (
              <img src={embed.author.icon_url} alt="" className="h-6 w-6 rounded-full" />
            )}
            <span className="text-sm font-bold text-white hover:underline cursor-pointer">
              {embed.author.name}
            </span>
          </div>
        )}

        {/* Title Preview */}
        {embed.title && (
          <div className="mb-2 text-base font-bold text-white hover:underline cursor-pointer">
            {embed.title}
          </div>
        )}

        {/* Description Preview */}
        {embed.description && (
          <div className="mb-3 whitespace-pre-wrap text-sm text-[#DBDEE1]">
            {embed.description}
          </div>
        )}

        {/* Fields Preview */}
        {embed.fields && embed.fields.length > 0 && (
          <div className="mb-3 grid grid-cols-12 gap-y-2">
            {embed.fields.map((f, i) => (
              <div 
                key={i} 
                className={f.inline ? "col-span-4" : "col-span-12"}
              >
                <div className="text-sm font-bold text-white">{f.name}</div>
                <div className="text-sm text-[#DBDEE1] whitespace-pre-wrap">{f.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Large Image Preview */}
        {embed.image?.url && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <img src={embed.image.url} alt="" className="max-w-full" />
          </div>
        )}

        {/* Footer Preview */}
        {embed.footer?.text && (
          <div className="mt-2 flex items-center gap-2">
            {embed.footer.icon_url && (
              <img src={embed.footer.icon_url} alt="" className="h-5 w-5 rounded-full" />
            )}
            <span className="text-xs text-[#949BA4]">
              {embed.footer.text}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Preview */}
      {embed.thumbnail?.url && (
        <div className="p-3 pl-0">
          <img src={embed.thumbnail.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
        </div>
      )}
    </div>
  );
}

interface EmbedBuilderProps {
  initialData?: string;
  onSave: (json: string) => void;
  onClose: () => void;
}

export default function EmbedBuilder({ initialData, onSave, onClose }: EmbedBuilderProps) {
  const [embed, setEmbed] = useState<EmbedData>(() => {
    try {
      return initialData ? JSON.parse(initialData) : { fields: [] };
    } catch {
      return { fields: [] };
    }
  });

  const [hexColor, setHexColor] = useState(() => {
    if (embed.color) {
      return "#" + embed.color.toString(16).padStart(6, "0");
    }
    return "#5865F2"; // Discord blurple
  });

  useEffect(() => {
    const colorInt = parseInt(hexColor.replace("#", ""), 16);
    if (!isNaN(colorInt)) {
      setEmbed(prev => ({ ...prev, color: colorInt }));
    }
  }, [hexColor]);

  const addField = () => {
    setEmbed(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { name: "", value: "", inline: false }]
    }));
  };

  const updateField = (index: number, key: keyof EmbedField, value: string | boolean) => {
    setEmbed(prev => {
      const newFields = [...(prev.fields || [])];
      newFields[index] = { ...newFields[index], [key]: value };
      return { ...prev, fields: newFields };
    });
  };

  const removeField = (index: number) => {
    setEmbed(prev => ({
      ...prev,
      fields: (prev.fields || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(JSON.stringify(embed, null, 2));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] shadow-2xl md:flex-row">
        {/* Left Side: Controls */}
        <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto border-r border-[var(--line)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Embed Builder</h3>
            <p className="text-xs text-[var(--text-faint)]">* All fields are optional</p>
          </div>

          <div className="space-y-6">
            {/* Color & Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                  Embed Color
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={hexColor}
                    onChange={(e) => setHexColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--bg-input)] p-1"
                  />
                  <input 
                    type="text"
                    value={hexColor}
                    onChange={(e) => setHexColor(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                  Title
                </label>
                <input 
                  type="text"
                  value={embed.title || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Enter Title"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                  Title URL
                </label>
                <input 
                  type="text"
                  value={embed.url || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Enter URL"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                Description
              </label>
              <textarea 
                rows={4}
                value={embed.description || ""}
                onChange={(e) => setEmbed(prev => ({ ...prev, description: e.target.value }))}
                className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                placeholder="Enter Description"
              />
            </div>

            {/* Author Section */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Author</h4>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={embed.author?.name || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, author: { ...prev.author, name: e.target.value } }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Author Name"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input 
                    type="text"
                    value={embed.author?.icon_url || ""}
                    onChange={(e) => setEmbed(prev => ({ ...prev, author: { ...prev.author || { name: "" }, icon_url: e.target.value } }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                    placeholder="Author Icon URL"
                  />
                  <input 
                    type="text"
                    value={embed.author?.url || ""}
                    onChange={(e) => setEmbed(prev => ({ ...prev, author: { ...prev.author || { name: "" }, url: e.target.value } }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                    placeholder="Author Link URL"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Thumbnail</h4>
                <input 
                  type="text"
                  value={embed.thumbnail?.url || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, thumbnail: { url: e.target.value } }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Thumbnail URL"
                />
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Large Image</h4>
                <input 
                  type="text"
                  value={embed.image?.url || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, image: { url: e.target.value } }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Image URL"
                />
              </div>
            </div>

            {/* Fields Section */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Fields</h4>
                <button 
                  type="button" 
                  onClick={addField}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--primary)] hover:underline"
                >
                  <PlusIcon className="h-3 w-3" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-4">
                {embed.fields?.map((field, idx) => (
                  <div key={idx} className="relative space-y-2 rounded-lg bg-[var(--bg-input)] p-3">
                    <button 
                      type="button"
                      onClick={() => removeField(idx)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg transition-transform hover:scale-110"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(idx, "name", e.target.value)}
                        className="flex-1 rounded border border-[var(--line)] bg-[var(--bg-surface)] px-2 py-1 text-xs text-white"
                        placeholder="Field Name"
                      />
                      <label className="flex items-center gap-2 text-[10px] text-[var(--text-faint)]">
                        Inline
                        <input 
                          type="checkbox"
                          checked={field.inline}
                          onChange={(e) => updateField(idx, "inline", e.target.checked)}
                        />
                      </label>
                    </div>
                    <textarea 
                      rows={2}
                      value={field.value}
                      onChange={(e) => updateField(idx, "value", e.target.value)}
                      className="w-full resize-none rounded border border-[var(--line)] bg-[var(--bg-surface)] px-2 py-1 text-xs text-white"
                      placeholder="Field Value"
                    />
                  </div>
                ))}
                {(!embed.fields || embed.fields.length === 0) && (
                  <p className="py-4 text-center text-xs italic text-[var(--text-faint)]">No fields added.</p>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] p-4">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Footer</h4>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={embed.footer?.text || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, footer: { ...prev.footer, text: e.target.value } }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Footer Text"
                />
                <input 
                  type="text"
                  value={embed.footer?.icon_url || ""}
                  onChange={(e) => setEmbed(prev => ({ ...prev, footer: { text: prev.footer?.text || "", icon_url: e.target.value } }))}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-sm text-white"
                  placeholder="Footer Icon URL"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-surface-elevated)] py-3 font-bold text-white transition-colors hover:bg-[var(--line)]"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[var(--primary)] py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              Apply to Command
            </button>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto bg-[#313338] p-6 lg:max-w-md">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white/40">Preview</h3>
          
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Discord Bot</span>
                <span className="rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Bot</span>
                <span className="text-[10px] text-[var(--text-faint)]">Today at 4:20 PM</span>
              </div>

              {/* Discord Embed Preview Container */}
              <div 
                className="mt-2 flex max-w-[432px] overflow-hidden rounded-md bg-[#2B2D31]"
                style={{ borderLeft: `4px solid ${hexColor}` }}
              >
                <div className="flex-1 p-3">
                  {/* Author Preview */}
                  {embed.author?.name && (
                    <div className="mb-2 flex items-center gap-2">
                      {embed.author.icon_url && (
                        <img src={embed.author.icon_url} alt="" className="h-6 w-6 rounded-full" />
                      )}
                      <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                        {embed.author.name}
                      </span>
                    </div>
                  )}

                  {/* Title Preview */}
                  {embed.title && (
                    <div className="mb-2 text-base font-bold text-white hover:underline cursor-pointer">
                      {embed.title}
                    </div>
                  )}

                  {/* Description Preview */}
                  {embed.description && (
                    <div className="mb-3 whitespace-pre-wrap text-sm text-[#DBDEE1]">
                      {embed.description}
                    </div>
                  )}

                  {/* Fields Preview */}
                  {embed.fields && embed.fields.length > 0 && (
                    <div className="mb-3 grid grid-cols-12 gap-y-2">
                      {embed.fields.map((f, i) => (
                        <div 
                          key={i} 
                          className={f.inline ? "col-span-4" : "col-span-12"}
                        >
                          <div className="text-sm font-bold text-white">{f.name}</div>
                          <div className="text-sm text-[#DBDEE1] whitespace-pre-wrap">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Large Image Preview */}
                  {embed.image?.url && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <img src={embed.image.url} alt="" className="max-w-full" />
                    </div>
                  )}

                  {/* Footer Preview */}
                  {embed.footer?.text && (
                    <div className="mt-2 flex items-center gap-2">
                      {embed.footer.icon_url && (
                        <img src={embed.footer.icon_url} alt="" className="h-5 w-5 rounded-full" />
                      )}
                      <span className="text-xs text-[#949BA4]">
                        {embed.footer.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Preview */}
                {embed.thumbnail?.url && (
                  <div className="p-3 pl-0">
                    <img src={embed.thumbnail.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
