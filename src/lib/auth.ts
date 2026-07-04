import { supabase } from "@/lib/supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Incorrect email or password.");
  }

  // Check status BEFORE resolving — this closes the silent-failure gap.
  // Without this, signIn() succeeds, the caller navigates, and the user
  // only gets kicked out later when useAuth's listener catches it async.
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error("Could not load your account. Contact your administrator.");
  }

  if (profile.status === "inactive") {
    await supabase.auth.signOut();
    throw new Error("This account has been deactivated. Contact your administrator.");
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}