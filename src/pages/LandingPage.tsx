import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CheckCircle2, Clock3, LogIn, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface PublicRoom {
	id: string;
	room_number: string;
	category: string | null;
	capacity: number;
	status: "vacant" | "reserved" | "occupied";
}

type Filter = "all" | PublicRoom["status"];

type StatusConfigEntry = {
	label: string;
	badge: string;
	icon: typeof CheckCircle2;
	block: string;
};

type StatusConfigMap = {
	vacant: StatusConfigEntry;
	reserved: StatusConfigEntry;
	occupied: StatusConfigEntry;
};

const STATUS_CONFIG: StatusConfigMap = {
	vacant: {
		label: "Vacant",
		badge: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900",
		icon: CheckCircle2,
		block: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-500",
	},
	reserved: {
		label: "Reserved",
		badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
		icon: Clock3,
		block: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-500",
	},
	occupied: {
		label: "Occupied",
		badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
		icon: XCircle,
		block: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-500",
	},
};

export default function LandingPage() {
	const { user, profile, loading } = useAuth();
	const [rooms, setRooms] = useState<PublicRoom[]>([]);
	const [roomsLoading, setRoomsLoading] = useState(true);
	const [filter, setFilter] = useState<Filter>("all");

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

	const counts = {
		all: rooms.length,
		vacant: rooms.filter((r) => r.status === "vacant").length,
		reserved: rooms.filter((r) => r.status === "reserved").length,
		occupied: rooms.filter((r) => r.status === "occupied").length,
	};
	const visibleRooms = filter === "all" ? rooms : rooms.filter((r) => r.status === filter);

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<Link to="/" className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
							S
						</span>
						<span className="text-sm font-semibold tracking-tight">Stae</span>
					</Link>
					{!loading &&
						(user && profile ? (
							<Button asChild size="sm">
								<Link to={`/${profile.role}`}>Go to dashboard</Link>
							</Button>
						) : (
							<Button asChild variant="outline" size="sm">
								<Link to="/login">
									<LogIn className="mr-2 h-4 w-4" />
									Log in
								</Link>
							</Button>
						))}
				</div>
			</header>

			<section className="mx-auto max-w-6xl px-6 pb-8 pt-14 text-center">
				<h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					Find your room
				</h1>
				<p className="mx-auto mt-3 max-w-md text-muted-foreground">
					Check live availability, then log in to manage your stay, mark attendance, or request leave.
				</p>
			</section>

			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-6 pb-10">
				{(["all", "vacant", "reserved", "occupied"] as Filter[]).map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => setFilter(f)}
						className={cn(
							"rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors",
							filter === f
								? "border-foreground bg-foreground text-background"
								: "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
						)}
					>
						{f === "all" ? "All rooms" : f} · {counts[f]}
					</button>
				))}
			</div>

			<section className="mx-auto max-w-6xl px-6 pb-20">
				{roomsLoading ? (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="overflow-hidden rounded-2xl border">
								<div className="h-28 animate-pulse bg-muted" />
								<div className="space-y-2 p-4">
									<div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
									<div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				) : visibleRooms.length === 0 ? (
					<div className="rounded-2xl border border-dashed py-16 text-center">
						<p className="text-sm text-muted-foreground">
							{rooms.length === 0 ? "No rooms available yet." : "No rooms match this filter."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{visibleRooms.map((room) => {
							const config = STATUS_CONFIG[room.status];
							const StatusIcon = config.icon;
							return (
								<div
									key={room.id}
									className="group overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
								>
									<div className={cn("flex h-28 items-center justify-center", config.block)}>
										<BedDouble className="h-9 w-9 opacity-70" strokeWidth={1.5} />
									</div>
									<div className="space-y-2 p-4">
										<div className="flex items-start justify-between gap-2">
											<h3 className="font-medium">Room {room.room_number}</h3>
											<Badge variant="outline" className={cn("shrink-0 gap-1", config.badge)}>
												<StatusIcon className="h-3 w-3" />
												{config.label}
											</Badge>
										</div>
										<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
											<Users className="h-3.5 w-3.5" />
											{room.category ?? "Standard"} · {room.capacity} bed{room.capacity > 1 ? "s" : ""}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}