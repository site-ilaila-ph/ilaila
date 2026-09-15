interface ManagementHeaderProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function ManagementHeader({
  breadcrumb,
  title,
  subtitle,
  children,
}: ManagementHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumb && (
          <p className="mb-2 text-xs font-medium text-muted-foreground">{breadcrumb}</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}

