import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = "superadmin" | "manager" | "staff";
type Status = "active" | "inactive";

interface Profile {
	id: string;
	name: string;
	email: string;
	role: Role;
	hostel_id: string | null;
	status: Status;
	photo_url: string | null;
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get current session on mount
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchProfile(session.user.id);
			} else {
				setLoading(false);
			}
		});

		// Listen for auth changes (login/logout in any tab)
		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
				if (session?.user) {
					fetchProfile(session.user.id);
				} else {
					setProfile(null);
					setLoading(false);
				}
			},
		);

		return () => listener.subscription.unsubscribe();
	}, []);

	async function fetchProfile(userId: string) {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) {
			console.error("Failed to fetch profile:", error.message);
			setProfile(null);
			setLoading(false);
			return;
		}

		const fetchedProfile = data as Profile;

		// Enforce deactivation at login. A status flag on its own does
		// nothing to Supabase Auth — without this check, a deactivated
		// staff member's existing session (and future logins) still work.
		if (fetchedProfile.status === "inactive") {
			await supabase.auth.signOut();
			setUser(null);
			setProfile(null);
			setLoading(false);
			return;
		}

		setProfile(fetchedProfile);
		setLoading(false);
	}

	async function refreshProfile() {
		if (user) {
			await fetchProfile(user.id);
		}
	}

	return { user, profile, loading, refreshProfile };
}
