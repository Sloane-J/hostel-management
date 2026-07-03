import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface PublicRoom {
	id: string;
	room_number: string;
	category: string | null;
	capacity: number;
	status: "vacant" | "reserved" | "occupied";
}

export default function LandingPage() {
	const { user, profile, loading } = useAuth();
	const [rooms, setRooms] = useState<PublicRoom[]>([]);
	const [roomsLoading, setRoomsLoading] = useState(true);

	useEffect(() => {
		async function fetchRooms() {
			const { data, error } = await supabase
				.from("rooms")
				.select("id, room_number, category, capacity, status")
				.order("room_number");

			if (error) {
				console.error("Failed to load rooms:", error.message);
			} else {
				setRooms(data as PublicRoom[]);
			}
			setRoomsLoading(false);
		}
		fetchRooms();
	}, []);

	const statusColor: Record<PublicRoom["status"], string> = {
		vacant: "bg-green-100 text-green-800",
		reserved: "bg-yellow-100 text-yellow-800",
		occupied: "bg-red-100 text-red-800",
	};

	return (
		<div className="min-h-screen bg-muted/40">
			{/* Header */}
			<header className="flex items-center justify-between border-b bg-background px-6 py-4">
				<h1 className="text-lg font-semibold">Hostel Management</h1>
				{!loading && (
					<>
						{user && profile ? (
							<Button asChild>
								<Link to={`/${profile.role}`}>Go to Dashboard</Link>
							</Button>
						) : (
							<Button asChild>
								<Link to="/login">Login</Link>
							</Button>
						)}
					</>
				)}
			</header>

			{/* Hero */}
			<section className="px-6 py-12 text-center">
				<h2 className="text-3xl font-bold tracking-tight">Welcome</h2>
				<p className="mt-2 text-muted-foreground">
					Browse available rooms below. Log in to manage your stay, mark
					attendance, or request leave.
				</p>
			</section>

			{/* Room listing */}
			<section className="mx-auto max-w-5xl px-6 pb-16">
				{roomsLoading ? (
					<p className="text-center text-muted-foreground">Loading rooms...</p>
				) : rooms.length === 0 ? (
					<p className="text-center text-muted-foreground">
						No rooms available yet.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{rooms.map((room) => (
							<Card key={room.id}>
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base">
										Room {room.room_number}
									</CardTitle>
									<Badge className={statusColor[room.status]}>
										{room.status}
									</Badge>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{room.category ?? "Standard"} · {room.capacity} bed
										{room.capacity > 1 ? "s" : ""}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
