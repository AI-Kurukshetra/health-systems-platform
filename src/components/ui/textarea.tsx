import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-border bg-white px-3.5 py-3 text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted invalid:border-rose-300 invalid:focus-visible:ring-rose-100",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
