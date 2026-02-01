import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
  noPadding?: boolean;
}

export function PageContainer({ 
  children, 
  className,
  withBottomNav = true,
  noPadding = false
}: PageContainerProps) {
  return (
    <main 
      className={cn(
        "min-h-screen bg-background",
        withBottomNav && "pb-20",
        !noPadding && "px-4",
        className
      )}
    >
      {children}
    </main>
  );
}
