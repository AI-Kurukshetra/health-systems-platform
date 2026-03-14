import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="app-surface max-w-md space-y-3 px-8 py-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Unauthorized</h1>
        <p className="text-sm leading-6 text-muted">You do not have permission to access this area.</p>
        <Link className="text-sm font-medium text-primary transition hover:text-primary-strong" href="/login">
          Go to login
        </Link>
      </div>
    </div>
  );
}
