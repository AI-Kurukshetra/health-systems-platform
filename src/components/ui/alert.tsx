import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.25)]", {
  variants: {
    variant: {
      info: "border-primary/15 bg-white text-foreground",
      success: "border-secondary/20 bg-[var(--success-soft)] text-foreground",
      warning: "border-primary/12 bg-[var(--warning-soft)] text-foreground",
      error: "border-rose-200 bg-[var(--danger-soft)] text-foreground",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
}

function Alert({ className, title, children, variant = "info", ...props }: AlertProps) {
  const Icon = alertIcons[variant ?? "info"];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="space-y-1">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        <div className="text-muted">{children}</div>
      </div>
    </div>
  );
}

export { Alert };
