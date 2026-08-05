import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  transparent?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function Header({
  title,
  showBack = false,
  showNotifications = false,
  transparent = false,
  rightElement,
  className,
  sticky = true,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "z-40 flex items-center justify-between h-14 px-4 shrink-0 box-content pt-[env(safe-area-inset-top,0px)]",
        sticky && "sticky top-0",
        transparent 
          ? "bg-transparent" 
          : "bg-background/80 backdrop-blur-lg border-b border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
            className="text-foreground shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className="text-lg font-semibold font-display truncate">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {rightElement}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/notifications")}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
        )}
      </div>
    </header>
  );
}
