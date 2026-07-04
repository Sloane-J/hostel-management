import { useEffect, useState } from "react";
import { StaffAvatar } from "@/components/staff/StaffAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export function StaffProfilePage() {
	const { user, profile, refreshProfile } = useAuth(); // adjust to your actual useAuth shape
	const [name, setName] = useState(profile?.name ?? "");
	const [file, setFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (profile?.name) setName(profile.name);
	}, [profile?.name]);

	async function handleSave() {
		if (!user) return;
		setSaving(true);
		setError(null);

		let photoPath = profile?.photo_url ?? null;

		if (file) {
			const ext = file.name.split(".").pop();
			const path = `${user.id}/avatar.${ext}`;
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

		const { error: updateError } = await supabase
			.from("users")
			.update({ name, photo_url: photoPath })
			.eq("id", user.id);

		setSaving(false);

		if (updateError) {
			setError("Failed to save changes.");
			return;
		}
		refreshProfile();
	}

	if (!profile)
		return <p className="text-sm text-muted-foreground">Loading…</p>;

	return (
		<div className="max-w-md space-y-6">
			<h1 className="text-lg font-semibold">My Profile</h1>
			<div className="flex justify-center">
				<StaffAvatar
					staffId={profile.id}
					photoPath={profile.photo_url}
					size={72}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="profile-name">Full name</Label>
				<Input
					id="profile-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="profile-photo">Photo</Label>
				<Input
					id="profile-photo"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={(e) => setFile(e.target.files?.[0] ?? null)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Email</Label>
				<Input value={profile.email} disabled />
			</div>
			<div className="space-y-2">
				<Label>Role</Label>
				<Input value={profile.role} disabled />
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button onClick={handleSave} disabled={saving}>
				{saving ? "Saving…" : "Save changes"}
			</Button>
		</div>
	);
}
