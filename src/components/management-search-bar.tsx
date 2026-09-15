import { Search } from "lucide-react";

interface ManagementSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ManagementSearchBar({
  value,
  onChange,
  placeholder = "Maghanap",
}: ManagementSearchBarProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-sm border border-border sm:w-64 sm:flex-none">
      <Search size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        suppressHydrationWarning
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

