import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
} as const;

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
}

function StatCard({ className, title, value, description, icon: Icon, tone = "primary", ...props }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {description ? <p className="text-sm text-muted">{description}</p> : null}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };
