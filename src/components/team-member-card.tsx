interface TeamMember {
  name: string;
  github?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  animationClass?: string;
}

export function TeamMemberCard({
  member,
  index,
  animationClass = "scale-in",
}: TeamMemberCardProps) {
  return (
    <div
      className={`card-lift ${animationClass} rounded-[1.5rem] border border-border bg-(--surface) p-6`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
      {member.github && (
        <p className="mt-2 text-sm text-primary">@{member.github}</p>
      )}
    </div>
  );
}

interface TeamSectionProps {
  title: string;
  features: string[];
  members: TeamMember[];
  slideDirection?: "left" | "right";
  cardAnimationClass?: string;
}

export function TeamSection({
  title,
  features,
  members,
  slideDirection = "left",
  cardAnimationClass = "scale-in",
}: TeamSectionProps) {
  const slideClass = slideDirection === "left" ? "slide-left" : "slide-right";

  return (
    <div>
      <div className={`mb-8 reveal ${slideClass}`}>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {features.join(" • ")}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {members.map((member, index) => (
          <TeamMemberCard
            key={`${member.name}-${index}`}
            member={member}
            index={index}
            animationClass={cardAnimationClass}
          />
        ))}
      </div>
    </div>
  );
}

