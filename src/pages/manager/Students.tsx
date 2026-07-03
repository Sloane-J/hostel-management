import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/nav/DashboardLayout";
import { StudentOnboardingForm } from "@/components/onboarding/StudentOnboardingForm";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  guardian_name: string;
  status: string;
  preferred_category: string | null;
}

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);

    const { data: profile } = await supabase.auth.getUser();
    const { data: userRow } = await supabase
      .from("users")
      .select("hostel_id")
      .eq("id", profile.user?.id)
      .single();

    const { data } = await supabase
      .from("students")
      .select("id, name, guardian_name, status, preferred_category")
      .order("created_at", { ascending: false });

    if (data) {
      setStudents(data);

      // Try to resolve a signed URL for each student's photo, if one exists.
      // List the folder for this hostel, match filenames by student id prefix.
      if (userRow?.hostel_id) {
        const { data: files } = await supabase.storage
          .from("student-photos")
          .list(userRow.hostel_id);

        if (files) {
          const urls: Record<string, string> = {};
          for (const student of data) {
            const match = files.find((f) => f.name.startsWith(student.id));
            if (match) {
              const { data: signed } = await supabase.storage
                .from("student-photos")
                .createSignedUrl(`${userRow.hostel_id}/${match.name}`, 3600); // 1 hour
              if (signed) urls[student.id] = signed.signedUrl;
            }
          }
          setPhotoUrls(urls);
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <DashboardLayout role="manager">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Students</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ Onboard Student</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Onboard New Student</DialogTitle>
              </DialogHeader>
              <StudentOnboardingForm onSuccess={fetchStudents} />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-muted-foreground">No students onboarded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader className="flex flex-row items-center gap-3">
                  <StudentAvatar
                    studentId={student.id}
                    photoUrl={photoUrls[student.id] ?? null}
                    name={student.name}
                    size={40}
                  />
                  <CardTitle className="text-base">{student.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Guardian: {student.guardian_name}
                  </p>
                  {student.preferred_category && (
                    <p className="text-xs text-muted-foreground">
                      Prefers: {student.preferred_category}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}