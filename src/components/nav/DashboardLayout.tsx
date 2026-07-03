import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopNav } from "@/components/nav/TopNav";
import { signOut } from "@/lib/auth";
import { navConfig } from "@/lib/nav-config";

type Role = "superadmin" | "manager" | "staff";

interface DashboardLayoutProps {
	role: Role;
	children: React.ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
	const navigate = useNavigate();
	const items = navConfig[role];

	async function handleSignOut() {
		await signOut();
		navigate("/", { replace: true });
	}

	return (
		<div className="min-h-screen bg-muted/40">
			<TopNav items={items} onSignOut={handleSignOut} />
			<main className="px-4 py-8 pb-28 sm:px-6 sm:pb-8">{children}</main>
			<BottomNav items={items} onSignOut={handleSignOut} />
		</div>
	);
}
