import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Search, label: "Rechercher", path: "/search" },
  { icon: Calendar, label: "RDV", path: "/appointments" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profil", path: "/profile" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav z-50" role="navigation" aria-label="Navigation principale">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl transition-all duration-200 touch-target",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200 flex items-center justify-center",
                isActive && "bg-primary/10"
              )}>
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-200 shrink-0",
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium transition-all truncate max-w-[56px]",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
