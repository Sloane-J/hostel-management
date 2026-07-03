import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function CreateHostelDialog({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const { error: insertError } = await supabase
				.from("hostels")
				.insert({ name, address });
			if (insertError) throw insertError;
			setOpen(false);
			setName("");
			setAddress("");
			onCreated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create hostel");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>+ New Hostel</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Hostel</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="hostelName">Name</Label>
						<Input
							id="hostelName"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="hostelAddress">Address</Label>
						<Input
							id="hostelAddress"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
