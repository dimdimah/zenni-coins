import { cn } from "@/lib/utils";

export function AppCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "bg-white border rounded-2xl shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}