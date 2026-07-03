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
		<header className="hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:block">
			<div className="flex h-14 items-center justify-between px-6">
				<div className="flex items-center gap-8">
					{/* Logo mark */}
					<Link to="/" className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
							S
						</span>
						<span className="text-sm font-semibold tracking-tight">Stae</span>
					</Link>

					{/* Nav */}
					<nav className="flex items-center gap-1">
						{items.map((item) => {
							const active = location.pathname === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									className={cn(
										"relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
										active
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
									)}
								>
									<item.icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
					<LogOut className="mr-2 h-4 w-4" />
					Sign out
				</Button>
			</div>
		</header>
	);
}