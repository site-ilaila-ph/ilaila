interface WebsitePoint {
  number: string;
  title: string;
  text: string;
}

interface WebsitePointsProps {
  points: WebsitePoint[];
}

export function WebsitePoints({ points }: WebsitePointsProps) {
  const animations = ["slide-left", "bounce-in", "scale-in", "bounce-in", "slide-right"];

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {points.map((point, index) => (
        <article
          key={point.title}
          className={`card-lift ${animations[index % animations.length]} rounded-[1.5rem] border border-border bg-(--surface) p-6`}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="pulse-glow mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-muted) text-sm font-bold text-primary">
            {point.number}
          </div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{point.title}</h2>
          <p className="text-sm leading-6 text-(--text-secondary)">{point.text}</p>
        </article>
      ))}
    </div>
  );
}

