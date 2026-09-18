import Link from "next/link";
import { WebsiteLogoAvatar } from "./website-logo-avatar";
import { cn } from "@/lib/utils";
import type { Route } from "next";

export interface AppNavProps {
  brandHref?: string;
  brandTitle?: string;
  brandSubtitle?: React.ReactNode;
  showLogo?: boolean;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function AppNav({
  brandHref = "/home",
  brandTitle = "Ilaila",
  brandSubtitle,
  showLogo = true,
  backHref,
  backLabel,
  children,
  className,
  containerClassName,
}: AppNavProps) {
  return (
    <nav
      className={cn(
        "border-b border-border bg-card/80 backdrop-blur",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4",
          containerClassName
        )}
      >
        <div className="flex items-center gap-3">
          {backHref && backLabel ? (
            <Link
              href={backHref as Route}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              {showLogo && <WebsiteLogoAvatar ir={24} pr={6} />}
              <span>{backLabel}</span>
            </Link>
          ) : (
            <Link
              href={brandHref as Route}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              {showLogo && <WebsiteLogoAvatar ir={24} pr={6} />}
              <span>{brandTitle}</span>
              {brandSubtitle}
            </Link>
          )}
        </div>

        {children ? (
          <div className="flex items-center gap-3">{children}</div>
        ) : null}
      </div>
    </nav>
  );
}

