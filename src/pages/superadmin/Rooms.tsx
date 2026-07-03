import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/nav/DashboardLayout";
import { HostelRoomsView } from "@/components/rooms/HostelRoomsView";
import { supabase } from "@/lib/supabase";

export default function SuperadminRoomsPage() {
	const [hostelId, setHostelId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchHostel() {
			const { data } = await supabase
				.from("hostels")
				.select("id")
				.order("created_at")
				.limit(1)
				.single();
			if (data) setHostelId(data.id);
			setLoading(false);
		}
		fetchHostel();
	}, []);

	return (
		<DashboardLayout role="superadmin">
			{loading ? (
				<p className="text-muted-foreground">Loading...</p>
			) : hostelId ? (
				<HostelRoomsView hostelId={hostelId} />
			) : (
				<p className="text-muted-foreground">No hostel created yet.</p>
			)}
		</DashboardLayout>
	);
}
