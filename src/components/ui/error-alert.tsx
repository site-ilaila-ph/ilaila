import * as React from "react";

import { cn } from "@/lib/utils";

export function ErrorAlert({
  message,
  className,
  onDismiss,
  ...props
}: React.ComponentProps<"div"> & {
  message?: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 wrap-break-word">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="I-dismiss ang error"
          className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}