"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDownIcon } from "@/components/dashboard/icons";

export interface ResourceDropdownItem {
  value: string;
  label: string;
  groupLabel?: string;
  selectable: boolean;
  reason?: string;
  isCurrentUnavailable?: boolean;
}

interface ResourceDropdownProps {
  name: string;
  label: string;
  defaultValue: string | null;
  items: ResourceDropdownItem[];
  helperText: string;
  placeholder: string;
  emptyMessage: string;
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function groupItems(items: ResourceDropdownItem[]) {
  const ungrouped: ResourceDropdownItem[] = [];
  const grouped = new Map<string, ResourceDropdownItem[]>();

  for (const item of items) {
    const groupLabel = item.groupLabel?.trim();

    if (!groupLabel) {
      ungrouped.push(item);
      continue;
    }

    const bucket = grouped.get(groupLabel);

    if (bucket) {
      bucket.push(item);
      continue;
    }

    grouped.set(groupLabel, [item]);
  }

  const sections: Array<{ groupLabel: string | null; items: ResourceDropdownItem[] }> = [];

  if (ungrouped.length > 0) {
    sections.push({ groupLabel: null, items: ungrouped });
  }

  for (const [groupLabel, sectionItems] of grouped.entries()) {
    sections.push({ groupLabel, items: sectionItems });
  }

  return sections;
}

function buildSelectableValues(items: ResourceDropdownItem[]) {
  return ["", ...items.filter((item) => item.selectable).map((item) => item.value)];
}

export function ResourceDropdown({
  name,
  label,
  defaultValue,
  items,
  helperText,
  placeholder,
  emptyMessage,
}: ResourceDropdownProps) {
  const normalizedDefaultValue = defaultValue ?? "";
  const [value, setValue] = useState(normalizedDefaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocusValueRef = useRef<string | null>(null);
  const labelId = useId();
  const listboxId = useId();

  useEffect(() => {
    setValue(normalizedDefaultValue);
  }, [normalizedDefaultValue]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectableValues = buildSelectableValues(items);
    const nextFocusValue =
      pendingFocusValueRef.current ??
      (value === "" || selectableValues.includes(value) ? value : selectableValues[0] ?? "");

    const frameId = window.requestAnimationFrame(() => {
      optionRefs.current.get(nextFocusValue)?.focus();
      pendingFocusValueRef.current = null;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isOpen, items, value]);

  const selectedItem = value === "" ? null : items.find((item) => item.value === value) ?? null;
  const groupedItems = groupItems(items);

  function setOptionRef(optionValue: string, node: HTMLButtonElement | null) {
    if (node) {
      optionRefs.current.set(optionValue, node);
      return;
    }

    optionRefs.current.delete(optionValue);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function selectValue(nextValue: string) {
    setValue(nextValue);
    closeDropdown();
    triggerRef.current?.focus();
  }

  function focusSelectableValue(direction: 1 | -1) {
    const selectableValues = buildSelectableValues(items);

    if (selectableValues.length === 0) {
      return;
    }

    const activeElement = document.activeElement;
    const activeValue =
      activeElement instanceof HTMLElement ? activeElement.dataset.optionValue ?? null : null;
    const activeIndex = activeValue === null ? -1 : selectableValues.indexOf(activeValue);
    const nextIndex =
      activeIndex === -1
        ? direction === 1
          ? 0
          : selectableValues.length - 1
        : (activeIndex + direction + selectableValues.length) % selectableValues.length;

    optionRefs.current.get(selectableValues[nextIndex])?.focus();
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const selectableValues = buildSelectableValues(items);

      if (event.key === "ArrowUp") {
        pendingFocusValueRef.current = selectableValues.at(-1) ?? "";
      } else {
        pendingFocusValueRef.current =
          value === "" || selectableValues.includes(value) ? value : selectableValues[0] ?? "";
      }

      setIsOpen(true);
    }
  }

  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const selectableValues = buildSelectableValues(items);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSelectableValue(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSelectableValue(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current.get(selectableValues[0] ?? "")?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      optionRefs.current.get(selectableValues.at(-1) ?? "")?.focus();
      return;
    }

    if (event.key === "Tab") {
      closeDropdown();
    }
  }

  return (
    <div ref={containerRef} className="resource-dropdown space-y-2">
      <span id={labelId} className="text-sm font-medium text-white">
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          className="control-input resource-dropdown__trigger"
          data-open={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={cx(
              "resource-dropdown__trigger-copy",
              value === "" && "resource-dropdown__trigger-copy--placeholder",
            )}
          >
            {selectedItem?.label ?? placeholder}
          </span>
          <ChevronDownIcon className="resource-dropdown__chevron h-4 w-4 text-[var(--text-faint)]" />
        </button>
        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="resource-dropdown__menu mobile-scroll"
            onKeyDown={handlePanelKeyDown}
          >
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              data-option-value=""
              ref={(node) => setOptionRef("", node)}
              className={cx(
                "resource-dropdown__option",
                value === "" && "resource-dropdown__option--selected",
              )}
              onClick={() => selectValue("")}
            >
              <span className="resource-dropdown__option-label">{placeholder}</span>
            </button>

            {groupedItems.length === 0 ? (
              <div className="resource-dropdown__empty">{emptyMessage}</div>
            ) : (
              groupedItems.map((section, sectionIndex) => (
                <div
                  key={section.groupLabel ?? `ungrouped-${sectionIndex}`}
                  className={cx(section.groupLabel && "resource-dropdown__group")}
                >
                  {section.groupLabel ? (
                    <p className="resource-dropdown__group-label">{section.groupLabel}</p>
                  ) : null}
                  {section.items.map((item) =>
                    item.selectable ? (
                      <button
                        key={item.value}
                        type="button"
                        role="option"
                        aria-selected={value === item.value}
                        data-option-value={item.value}
                        ref={(node) => setOptionRef(item.value, node)}
                        className={cx(
                          "resource-dropdown__option",
                          value === item.value && "resource-dropdown__option--selected",
                          item.isCurrentUnavailable && "resource-dropdown__option--unavailable",
                        )}
                        onClick={() => selectValue(item.value)}
                      >
                        <span className="resource-dropdown__option-label">{item.label}</span>
                        {item.reason ? (
                          <span className="resource-dropdown__option-reason">{item.reason}</span>
                        ) : null}
                      </button>
                    ) : (
                      <div
                        key={item.value}
                        role="option"
                        aria-disabled="true"
                        aria-selected={value === item.value}
                        className={cx(
                          "resource-dropdown__option resource-dropdown__option--disabled",
                          value === item.value && "resource-dropdown__option--selected",
                        )}
                      >
                        <span className="resource-dropdown__option-label">{item.label}</span>
                        {item.reason ? (
                          <span className="resource-dropdown__option-reason">{item.reason}</span>
                        ) : null}
                      </div>
                    ),
                  )}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      <p className="text-sm subtle-copy">{helperText}</p>
    </div>
  );
}
