import { ChevronRight } from "lucide-react";
import { Route } from "next";
import Link from "next/link";

function ManagementCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: Route;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5 transition hover:border-primary hover:bg-muted/60"
    >
      <div className="flex items-start justify-between w-full">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <div className="inline-block rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
              {badge}
            </div>
          )}
          <ChevronRight className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" size={18} />
        </div>
      </div>
    </Link>
  );
}

export { ManagementCard };