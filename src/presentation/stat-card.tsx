
function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "orange" | "green" | "pink" | "yellow";
}) {
  const tones = {
    blue: "bg-primary/10 text-primary",
    violet: "bg-accent/30 text-accent-foreground",
    orange: "bg-secondary text-secondary-foreground",
    green: "bg-primary/20 text-primary",
    pink: "bg-accent/20 text-accent-foreground",
    yellow: "bg-muted text-foreground",
  };
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p><div className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div></div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
      <div className="mt-3 h-1 rounded-full bg-muted"><div className="h-1 rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

export { StatCard };