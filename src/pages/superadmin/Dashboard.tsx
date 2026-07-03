import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/nav/DashboardLayout";
import { CreateHostelDialog } from "@/components/superadmin/CreateHostelDialog";
import { InviteManagerDialog } from "@/components/superadmin/InviteManagerDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface Hostel {
	id: string;
	name: string;
	address: string | null;
}

interface Manager {
	id: string;
	name: string;
	email: string;
	hostel_id: string;
}

export default function SuperadminDashboard() {
	const [hostels, setHostels] = useState<Hostel[]>([]);
	const [managers, setManagers] = useState<Manager[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(async () => {
		setLoading(true);
		const [hostelsRes, managersRes] = await Promise.all([
			supabase.from("hostels").select("*").order("created_at"),
			supabase
				.from("users")
				.select("id, name, email, hostel_id")
				.eq("role", "manager"),
		]);
		if (hostelsRes.data) setHostels(hostelsRes.data);
		if (managersRes.data) setManagers(managersRes.data);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<DashboardLayout role="superadmin">
			<div className="mx-auto max-w-5xl">
				<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-xl font-semibold">Hostels</h2>
					<CreateHostelDialog onCreated={fetchData} />
				</div>

				{loading ? (
					<p className="text-muted-foreground">Loading...</p>
				) : hostels.length === 0 ? (
					<p className="text-muted-foreground">
						No hostels yet — create one to get started.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{hostels.map((hostel) => {
							const manager = managers.find((m) => m.hostel_id === hostel.id);
							return (
								<Card key={hostel.id}>
									<CardHeader>
										<CardTitle className="text-base">{hostel.name}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{hostel.address && (
											<p className="text-sm text-muted-foreground">
												{hostel.address}
											</p>
										)}

										{manager ? (
											<div className="flex items-center justify-between border p-3">
												<div>
													<p className="text-sm font-medium">{manager.name}</p>
													<p className="text-xs text-muted-foreground">
														{manager.email}
													</p>
												</div>
												<Badge>Manager</Badge>
											</div>
										) : (
											<InviteManagerDialog
												hostelId={hostel.id}
												hostelName={hostel.name}
												onInvited={fetchData}
											/>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
