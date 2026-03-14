import * as React from "react";

import { cn } from "@/lib/utils";

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted invalid:border-rose-300 invalid:focus-visible:ring-rose-100",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
