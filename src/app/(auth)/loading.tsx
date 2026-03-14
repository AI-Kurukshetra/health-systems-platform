import { LoadingCard } from "@/components/ui/loading-card";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <LoadingCard lines={6} className="w-full max-w-md" />
    </div>
  );
}
