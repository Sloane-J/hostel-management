import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface UnassignedStudent {
  id: string;
  name: string;
}

interface AssignRoomDialogProps {
  roomId: string;
  roomNumber: string;
  hostelId: string;
  onAssigned: () => void;
}

export function AssignRoomDialog({ roomId, roomNumber, hostelId, onAssigned }: AssignRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<UnassignedStudent[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    async function fetchUnassigned() {
      const { data } = await supabase
        .from("students")
        .select("id, name")
        .eq("hostel_id", hostelId)
        .is("room_id", null)
        .eq("status", "active");
      if (data) setStudents(data);
    }
    fetchUnassigned();
  }, [open, hostelId]);

  async function handleAssign() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc("assign_student_to_room", {
        p_room_id: roomId,
        p_student_id: selected,
      });
      if (rpcError) throw rpcError;
      setOpen(false);
      setSelected("");
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Assign Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Student — Room {roomNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unassigned students available.</p>
          ) : (
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button onClick={handleAssign} disabled={!selected || loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}