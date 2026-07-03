import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  items: NavItem[];
  onSignOut: () => void;
}

export function BottomNav({ items, onSignOut }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-full border bg-background px-2 py-2 shadow-lg sm:hidden">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onSignOut}
        className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </nav>
  );
}