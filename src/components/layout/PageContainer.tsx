import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
  noPadding?: boolean;
  fullHeight?: boolean;
}

export function PageContainer({ 
  children, 
  className,
  withBottomNav = true,
  noPadding = false,
  fullHeight = false
}: PageContainerProps) {
  return (
    <main 
      className={cn(
        "bg-background overflow-x-hidden",
        fullHeight ? "min-h-dvh" : "min-h-screen",
        withBottomNav && "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]",
        !noPadding && "px-4",
        className
      )}
    >
      {children}
    </main>
  );
}
