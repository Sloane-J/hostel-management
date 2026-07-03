import { LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface TopNavProps {
	items: NavItem[];
	onSignOut: () => void;
}

export function TopNav({ items, onSignOut }: TopNavProps) {
	const location = useLocation();

	return (
		<header className="hidden border-b bg-background px-6 py-3 sm:flex sm:items-center sm:justify-between">
			<div className="flex items-center gap-8">
				<span className="text-sm font-semibold">Hostel Management</span>
				<nav className="flex items-center gap-1">
					{items.map((item) => {
						const active = location.pathname === item.path;
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
									active
										? "border-b-2 border-foreground text-foreground"
										: "border-b-2 border-transparent text-muted-foreground",
								)}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>
			<Button variant="outline" size="sm" onClick={onSignOut}>
				<LogOut className="mr-2 h-4 w-4" />
				Sign out
			</Button>
		</header>
	);
}
