import { DashboardLayout } from "@/components/nav/DashboardLayout";
import { HostelRoomsView } from "@/components/rooms/HostelRoomsView";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerRoomsPage() {
	const { profile } = useAuth();
	if (!profile?.hostel_id) return null;

	return (
		<DashboardLayout role="manager">
			<HostelRoomsView hostelId={profile.hostel_id} />
		</DashboardLayout>
	);
}
