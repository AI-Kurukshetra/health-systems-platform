import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

function LoadingCard({ className, lines = 3, ...props }: LoadingCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="space-y-3 p-5">
        <div className="skeleton-line h-4 w-24" />
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={cn("skeleton-line h-3", index === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </CardContent>
    </Card>
  );
}

export { LoadingCard };
