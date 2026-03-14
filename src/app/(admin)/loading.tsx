import { LoadingCard } from "@/components/ui/loading-card";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <LoadingCard lines={2} className="h-[120px]" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
      <LoadingCard lines={5} className="h-[280px]" />
    </div>
  );
}
