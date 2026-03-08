import Link from "next/link";

import { ArrowRightIcon } from "@/components/dashboard/icons";

interface LogTableProps {
  title: string;
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
  actionHref?: string;
  actionLabel?: string;
}

export function LogTable({
  title,
  columns,
  rows,
  emptyMessage,
  actionHref,
  actionLabel,
}: LogTableProps) {
  return (
    <section className="table-panel overflow-hidden rounded-[32px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm subtle-copy">{rows.length} rows in view</p>
        </div>

        {actionHref && actionLabel ? (
          <Link href={actionHref} className="secondary-button px-4 py-2 text-sm">
            {actionLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-[22px] border border-dashed border-[var(--line)] p-5 text-sm leading-6 subtle-copy">
            {emptyMessage}
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-3 px-5 py-5 sm:hidden">
            {rows.map((row, index) => (
              <div
                key={index}
                className="control-card rounded-[22px] p-4"
              >
                <div className="space-y-3">
                  {row.map((cell, cellIndex) => (
                    <div
                      key={`${index}-${cellIndex}`}
                      className="grid gap-1 border-b border-[var(--line)]/50 pb-3 last:border-b-0 last:pb-0"
                    >
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                        {columns[cellIndex] ?? `Column ${cellIndex + 1}`}
                      </p>
                      <div className="text-sm text-[var(--text)]">{cell}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-black/10 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  {columns.map((column) => (
                    <th key={column} className="px-6 py-4 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--line)]/70 align-top transition hover:bg-white/[0.035]"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={`${index}-${cellIndex}`} className="px-6 py-5 text-[var(--text)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
