import { LoadingCard } from "@/components/ui/loading-card";

export default function PatientLoading() {
  return (
    <div className="space-y-6">
      <LoadingCard lines={2} className="h-[140px]" />
      <div className="grid gap-4 md:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>
      <LoadingCard lines={6} className="h-[300px]" />
    </div>
  );
}
