import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxWidth?: "sm" | "3xl";
}

export function AuthLayout({
  children,
  className,
  containerClassName,
  maxWidth = "sm",
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
        className
      )}
    >
      <div
        className={cn(
          "w-full",
          maxWidth === "3xl" ? "max-w-3xl" : "max-w-sm",
          containerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

