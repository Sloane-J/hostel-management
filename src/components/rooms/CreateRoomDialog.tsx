import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type CreateRoomValues, createRoomSchema } from "@/lib/schemas/room";
import { supabase } from "@/lib/supabase";

interface CreateRoomDialogProps {
	hostelId: string;
	onCreated: () => void;
}

export function CreateRoomDialog({
	hostelId,
	onCreated,
}: CreateRoomDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const form = useForm<CreateRoomValues>({
		resolver: zodResolver(createRoomSchema),
		defaultValues: { room_number: "", category: "Standard", capacity: 4 },
	});

	async function onSubmit(values: CreateRoomValues) {
		setError(null);
		setLoading(true);
		try {
			const { data: room, error: roomError } = await supabase
				.from("rooms")
				.insert({
					hostel_id: hostelId,
					room_number: values.room_number,
					category: values.category,
					capacity: values.capacity,
				})
				.select()
				.single();
			if (roomError) throw roomError;

			const beds = Array.from({ length: values.capacity }, (_, i) => ({
				room_id: room.id,
				bed_label: String.fromCharCode(65 + i),
			}));
			const { error: bedsError } = await supabase.from("beds").insert(beds);
			if (bedsError) throw bedsError;

			setOpen(false);
			form.reset();
			onCreated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create room");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">+ New Room</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Room</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="room_number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Room number</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g. 103" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g. Standard, Deluxe" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="capacity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Capacity (number of beds)</FormLabel>
									<FormControl>
										<Input {...field} type="number" min={1} max={10} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<DialogFooter>
							<Button type="submit" disabled={loading}>
								{loading ? "Creating..." : "Create Room"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
