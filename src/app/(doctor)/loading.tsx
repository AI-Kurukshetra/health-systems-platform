import { LoadingCard } from "@/components/ui/loading-card";

export default function DoctorLoading() {
  return (
    <div className="space-y-6">
      <LoadingCard lines={2} className="h-[140px]" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
      <LoadingCard lines={6} className="h-[320px]" />
    </div>
  );
}
