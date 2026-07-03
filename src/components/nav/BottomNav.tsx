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
		<nav
			className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-full border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden"
			style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
		>
			{items.map((item) => {
				const active = location.pathname === item.path;
				return (
					<Link
						key={item.path}
						to={item.path}
						aria-label={item.label}
						className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
					>
						<item.icon
							className={cn(
								"h-[22px] w-[22px] transition-colors",
								active ? "text-foreground" : "text-muted-foreground",
							)}
							strokeWidth={active ? 2.25 : 1.85}
						/>
						<span
							className={cn(
								"absolute bottom-1 h-1 w-1 rounded-full transition-opacity",
								active ? "bg-foreground opacity-100" : "opacity-0",
							)}
							aria-hidden="true"
						/>
					</Link>
				);
			})}

			<div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

			<button
				type="button"
				onClick={onSignOut}
				aria-label="Sign out"
				className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
			>
				<LogOut className="h-[22px] w-[22px]" strokeWidth={1.85} />
			</button>
		</nav>
	);
}