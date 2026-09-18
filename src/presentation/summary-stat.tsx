function SummaryStat({ value, label }: { value: number; label: string }) {
  return <div><p className="text-lg font-bold text-foreground">{value.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>;
}

export { SummaryStat }