import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[linear-gradient(135deg,var(--secondary),var(--primary))] text-white shadow-[0_18px_30px_-20px_rgba(20,131,136,0.34)] hover:brightness-105",
        outline: "border border-primary/30 bg-white/80 text-primary hover:border-accent/40 hover:bg-primary/8",
        secondary: "bg-[linear-gradient(135deg,var(--accent),#ffd86c)] text-[color:#21515a] shadow-[0_18px_30px_-20px_rgba(255,198,58,0.36)] hover:brightness-105",
        ghost: "bg-transparent text-foreground hover:bg-primary/8",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
