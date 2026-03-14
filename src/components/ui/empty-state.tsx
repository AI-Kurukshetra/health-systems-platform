import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyState({ className, icon: Icon, title, description, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-3xl border border-dashed border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(237,250,250,0.78),rgba(255,252,238,0.72))] px-5 py-6 text-left",
        className,
      )}
      {...props}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(36,193,191,0.16),rgba(255,198,58,0.18))] text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}

export { EmptyState };
