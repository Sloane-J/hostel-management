import { useCallback, useEffect, useState } from "react";
import { AssignRoomDialog } from "@/components/rooms/AssignRoomDialog";
import { CreateRoomDialog } from "@/components/rooms/CreateRoomDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface Bed {
	id: string;
	bed_label: string;
	status: "vacant" | "occupied";
	student_id: string | null;
	student_name: string | null;
}

interface Room {
	id: string;
	room_number: string;
	category: string | null;
	capacity: number;
	status: "vacant" | "reserved" | "occupied";
	beds: Bed[];
}

interface HostelRoomsViewProps {
	hostelId: string;
	readOnly?: boolean;
}

const statusColor: Record<Room["status"], string> = {
	vacant: "bg-green-100 text-green-800",
	reserved: "bg-yellow-100 text-yellow-800",
	occupied: "bg-red-100 text-red-800",
};

export function HostelRoomsView({
	hostelId,
	readOnly = false,
}: HostelRoomsViewProps) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchRooms = useCallback(async () => {
		setLoading(true);
		const { data: roomsData } = await supabase
			.from("rooms")
			.select("id, room_number, category, capacity, status")
			.eq("hostel_id", hostelId)
			.order("room_number");

		if (!roomsData) {
			setLoading(false);
			return;
		}

		const { data: bedsData } = await supabase
			.from("beds")
			.select("id, room_id, bed_label, status, student_id, students(name)")
			.in(
				"room_id",
				roomsData.map((r) => r.id),
			);

		const roomsWithBeds: Room[] = roomsData.map((room) => ({
			...room,
			beds: (bedsData ?? [])
				.filter((b: any) => b.room_id === room.id)
				.map((b: any) => ({
					id: b.id,
					bed_label: b.bed_label,
					status: b.status,
					student_id: b.student_id,
					student_name: b.students?.name ?? null,
				}))
				.sort((a: Bed, b: Bed) => a.bed_label.localeCompare(b.bed_label)),
		}));

		setRooms(roomsWithBeds);
		setLoading(false);
	}, [hostelId]);

	useEffect(() => {
		fetchRooms();
	}, [fetchRooms]);

	async function handleUnassign(bedId: string) {
		const { error } = await supabase.rpc("unassign_bed", { p_bed_id: bedId });
		if (!error) fetchRooms();
	}

	const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
	const occupiedBeds = rooms.reduce(
		(sum, r) => sum + r.beds.filter((b) => b.status === "occupied").length,
		0,
	);
	const vacantRooms = rooms.filter((r) => r.status === "vacant").length;

	return (
		<div className="mx-auto max-w-5xl">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-xl font-semibold">Rooms</h2>
				{!readOnly && (
					<CreateRoomDialog hostelId={hostelId} onCreated={fetchRooms} />
				)}
			</div>

			<div className="mb-6 grid grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<p className="text-2xl font-semibold">
							{occupiedBeds}/{totalBeds}
						</p>
						<p className="text-xs text-muted-foreground">Beds occupied</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-2xl font-semibold">{rooms.length}</p>
						<p className="text-xs text-muted-foreground">Total rooms</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-2xl font-semibold">{vacantRooms}</p>
						<p className="text-xs text-muted-foreground">Fully vacant rooms</p>
					</CardContent>
				</Card>
			</div>

			{loading ? (
				<p className="text-muted-foreground">Loading...</p>
			) : rooms.length === 0 ? (
				<p className="text-muted-foreground">
					No rooms yet — create one to get started.
				</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{rooms.map((room) => {
						const hasVacancy = room.beds.some((b) => b.status === "vacant");
						return (
							<Card key={room.id}>
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base">
										Room {room.room_number}
									</CardTitle>
									<Badge className={statusColor[room.status]}>
										{room.status}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-3">
									<p className="text-xs text-muted-foreground">
										{room.category ?? "Standard"} · {room.capacity} bed
										{room.capacity > 1 ? "s" : ""}
									</p>

									<div className="space-y-2">
										{room.beds.map((bed) => (
											<div
												key={bed.id}
												className="flex items-center justify-between border p-2 text-sm"
											>
												<div>
													<span className="font-medium">
														Bed {bed.bed_label}
													</span>
													{bed.student_name && (
														<span className="ml-2 text-muted-foreground">
															{bed.student_name}
														</span>
													)}
												</div>
												{!readOnly && bed.status === "occupied" && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleUnassign(bed.id)}
													>
														Unassign
													</Button>
												)}
											</div>
										))}
									</div>

									{!readOnly && hasVacancy && (
										<AssignRoomDialog
											roomId={room.id}
											roomNumber={room.room_number}
											hostelId={hostelId}
											onAssigned={fetchRooms}
										/>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
