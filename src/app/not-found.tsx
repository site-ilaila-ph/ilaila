import { Route } from "next";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Hindi nahanap ang pahina</h1>
      <p className="text-muted-foreground">
        Ang pahinang hinahanap mo ay wala o inilipat na.
      </p>
      <Link
        href={"/" as Route}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Bumalik sa home
      </Link>
    </main>
  );
}