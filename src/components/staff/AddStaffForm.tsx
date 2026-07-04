// src/components/staff/AddStaffForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { generateTempPassword } from "@/lib/generate-credentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const staffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
});

type StaffFormValues = z.infer<typeof staffSchema>;

export function AddStaffForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{ email: string; password: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true);
    const tempPassword = generateTempPassword();

    const { error } = await supabase.functions.invoke("provision-account", {
      body: { type: "staff", name: values.name, email: values.email, password: tempPassword },
    });
    setSubmitting(false);

    if (error) {
      console.error("Failed to provision staff account:", error.message);
      form.setError("email", { message: "Could not create account. Email may already be in use." });
      return;
    }

    setTempCredentials({ email: values.email, password: tempPassword });
    form.reset();
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setTempCredentials(null)}>Add Staff</Button>
      </DialogTrigger>
      <DialogContent>
        {tempCredentials ? (
          <>
            <DialogHeader><DialogTitle>Staff account created</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Share these credentials manually. They will not be shown again.
            </p>
            <div className="rounded-md border p-3 text-sm space-y-1">
              <p><strong>Email:</strong> {tempCredentials.email}</p>
              <p><strong>Temp password:</strong> {tempCredentials.password}</p>
            </div>
            <DialogFooter><Button onClick={() => setOpen(false)}>Done</Button></DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl><Input placeholder="e.g. Kwame Asante" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="staffmember@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating…" : "Create account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}