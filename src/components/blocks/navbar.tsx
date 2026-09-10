import Link from "next/link";
import { WebsiteLogoAvatar } from "./website-logo-avatar";
import { cn } from "@/lib/utils";

interface NavLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  href: string;
}

function NavLink({ className, children, ...props }: NavLinkProps) {
  return (
    <Link
      className={cn(
        "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

interface NavbarProps {
  children?: React.ReactNode;
}

function Navbar({ children }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-(--surface)/75 shadow-sm shadow-primary/10 backdrop-blur-xl supports-backdrop-filter:bg-(--surface)/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-primary"
        >
            <WebsiteLogoAvatar ir={24} pr={6} />
            <span className="text-primary">Ilaila</span>
        </Link>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </nav>
  );
}

export { Navbar, NavLink };