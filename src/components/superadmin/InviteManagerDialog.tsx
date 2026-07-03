import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseIsolated } from "@/lib/supabase-isolated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

interface InviteManagerDialogProps {
  hostelId: string;
  hostelName: string;
  onInvited: () => void;
}

function generateTempPassword() {
  // 12 chars, mixed case + digits — good enough for a one-time credential
  // the manager is expected to change on first login
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function InviteManagerDialog({ hostelId, hostelName, onInvited }: InviteManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tempPassword = generateTempPassword();

    try {
      // 1. Create the auth account via the isolated client — doesn't touch your session
      const { data: signUpData, error: signUpError } = await supabaseIsolated.auth.signUp({
        email,
        password: tempPassword,
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Account creation failed unexpectedly");

      // 2. Insert their profile row using the MAIN client — still authenticated
      // as you (superadmin), so RLS's "superadmin full access" policy allows this insert
      const { error: insertError } = await supabase.from("users").insert({
        id: signUpData.user.id,
        name,
        email,
        role: "manager",
        hostel_id: hostelId,
      });
      if (insertError) throw insertError;

      setCredentials({ email, password: tempPassword });
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create manager account");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setEmail("");
    setCredentials(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm">Add Manager</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Manager — {hostelName}</DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Account created. Share these credentials with the manager directly —
              they won't be shown again.
            </p>
            <div className="space-y-2 border p-3 text-sm">
              <p><span className="font-medium">Email:</span> {credentials.email}</p>
              <p><span className="font-medium">Temporary password:</span> {credentials.password}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommend they log in and use "Forgot password" to set their own password immediately.
            </p>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Manager Account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}