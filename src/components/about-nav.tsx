import Link from "next/link";

type AboutPageKey = "san-pedro" | "the-team" | "the-website";

const aboutLinks: { key: AboutPageKey; href: string; label: string }[] = [
  { key: "san-pedro", href: "/about/san-pedro", label: "San Pedro" },
  { key: "the-team", href: "/about/the-team", label: "Ang Koponan" },
  { key: "the-website", href: "/about/the-website", label: "Ang Website" },
];

interface AboutNavProps {
  current: AboutPageKey;
  /** Secondary text token used by the sibling links — it differs per about page. */
  linkClassName?: string;
}

export function AboutNav({
  current,
  linkClassName = "text-muted-foreground",
}: AboutNavProps) {
  return (
    <nav className="relative z-10 border-b border-border bg-(--surface)/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            I
          </span>
          Ilaila
        </Link>

        <div className="flex items-center gap-3">
          {aboutLinks
            .filter((link) => link.key !== current)
            .map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-full border border-border px-4 py-2 text-sm font-medium ${linkClassName} transition hover:bg-muted`}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}

