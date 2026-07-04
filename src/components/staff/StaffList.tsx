import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StaffAvatar } from "./StaffAvatar";
import { AddStaffForm } from "./AddStaffForm";
import { EditStaffForm } from "./EditStaffForm";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  photo_url: string | null;
  created_at: string;
};

export function StaffList() {
  const { profile } = useAuth(); // expects profile.hostel_id from your useAuth
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  async function fetchStaff() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, status, photo_url, created_at")
      .eq("role", "staff")
      .eq("hostel_id", profile?.hostel_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch staff:", error.message);
    } else {
      setStaff(data as StaffMember[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (profile?.hostel_id) fetchStaff();
  }, [profile?.hostel_id]);

  async function toggleStatus(member: StaffMember) {
    const newStatus = member.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", member.id);

    if (error) {
      console.error("Failed to update status:", error.message);
      return;
    }
    fetchStaff();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading staff…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Staff</h2>
        <AddStaffForm onCreated={fetchStaff} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date added</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <StaffAvatar staffId={member.id} photoPath={member.photo_url} size={32} />
              </TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Badge variant={member.status === "active" ? "default" : "secondary"}>
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditingStaff(member)}>
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      {member.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {member.status === "active" ? "Deactivate" : "Activate"} {member.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {member.status === "active"
                          ? "This immediately blocks their login. They cannot sign in until reactivated."
                          : "This restores their login access."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => toggleStatus(member)}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingStaff && (
        <EditStaffForm
          staff={editingStaff}
          open={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          onSaved={fetchStaff}
        />
      )}
    </div>
  );
}