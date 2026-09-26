import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface CalcTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

/** Generic year-by-year breakdown table shared by every calculator —
 * same bordered, scrollable-on-mobile shape as the rest of the app's
 * tables (see components/recommendations/recommendation-table.tsx). */
export function CalcDataTable<T>({
  columns,
  rows,
  getRowKey,
  footer,
}: {
  columns: CalcTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 font-medium",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  (!column.align || column.align === "left") && "text-left",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)} className="hover:bg-muted/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-foreground",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer}
      </table>
    </div>
  );
}
