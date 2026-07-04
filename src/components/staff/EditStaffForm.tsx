import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { StaffAvatar } from "./StaffAvatar";

type StaffMember = { id: string; name: string; photo_url: string | null };

type EditStaffFormProps = {
	staff: StaffMember;
	open: boolean;
	onClose: () => void;
	onSaved: () => void;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EditStaffForm({
	staff,
	open,
	onClose,
	onSaved,
}: EditStaffFormProps) {
	const [name, setName] = useState(staff.name);
	const [file, setFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = e.target.files?.[0];
		if (!selected) return;
		if (!ALLOWED_TYPES.includes(selected.type)) {
			setError("Only JPG, PNG, or WEBP images are allowed.");
			return;
		}
		if (selected.size > MAX_PHOTO_BYTES) {
			setError("Photo must be under 5MB.");
			return;
		}
		setError(null);
		setFile(selected);
	}

	async function handleSave() {
		setSaving(true);
		setError(null);

		let photoPath = staff.photo_url;

		if (file) {
			const ext = file.name.split(".").pop();
			const path = `${staff.id}/avatar.${ext}`;
			const { error: uploadError } = await supabase.storage
				.from("staff-photos")
				.upload(path, file, { upsert: true });

			if (uploadError) {
				setError("Failed to upload photo.");
				setSaving(false);
				return;
			}
			photoPath = path;
		}

		// role/hostel_id deliberately omitted — DB trigger blocks them anyway,
		// but leaving them out keeps intent explicit here.
		const { error: updateError } = await supabase
			.from("users")
			.update({ name, photo_url: photoPath })
			.eq("id", staff.id);

		setSaving(false);

		if (updateError) {
			setError("Failed to save changes.");
			return;
		}

		onSaved();
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Staff</DialogTitle>
				</DialogHeader>
				<div className="flex justify-center">
					<StaffAvatar
						staffId={staff.id}
						photoPath={staff.photo_url}
						size={64}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="staff-name">Full name</Label>
					<Input
						id="staff-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="staff-photo">Photo</Label>
					<Input
						id="staff-photo"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleFileChange}
					/>
				</div>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={saving}>
						{saving ? "Saving…" : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
