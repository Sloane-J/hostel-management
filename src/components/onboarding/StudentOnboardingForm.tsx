import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PhotoUpload } from "@/components/onboarding/PhotoUpload";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
	generateLoginEmail,
	generateTempPassword,
} from "@/lib/generate-credentials";
import {
	type StudentOnboardingValues,
	studentOnboardingSchema,
} from "@/lib/schemas/student";
import { supabase } from "@/lib/supabase";

interface StudentOnboardingFormProps {
	onSuccess: () => void;
}

export function StudentOnboardingForm({
	onSuccess,
}: StudentOnboardingFormProps) {
	const { profile } = useAuth();
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [credentials, setCredentials] = useState<{
		email: string;
		password: string;
		name: string;
	} | null>(null);

	const form = useForm<StudentOnboardingValues>({
		resolver: zodResolver(studentOnboardingSchema),
		defaultValues: {
			name: "",
			guardian_name: "",
			guardian_phone: "",
			guardian_email: "",
			preferred_category: "",
		},
	});

	async function onSubmit(values: StudentOnboardingValues) {
		if (!profile?.hostel_id) {
			setError("No hostel context found for your account.");
			return;
		}
		setError(null);
		setSubmitting(true);

		const loginEmail = generateLoginEmail(values.name);
		const tempPassword = generateTempPassword();

		try {
			const { data: sessionData } = await supabase.auth.getSession();
			const { data, error: fnError } = await supabase.functions.invoke(
				"provision-account",
				{
					body: {
						type: "student",
						name: values.name,
						guardian_name: values.guardian_name,
						guardian_phone: values.guardian_phone,
						guardian_email: values.guardian_email,
						preferred_category: values.preferred_category,
						login_email: loginEmail,
						password: tempPassword,
						hostel_id: profile.hostel_id,
					},
					headers: {
						Authorization: `Bearer ${sessionData.session?.access_token}`,
					},
				},
			);
			if (fnError) throw fnError;
			if (data?.error) throw new Error(data.error);

			// Upload photo if provided, now that we have the real student id
			if (photoFile && data.student_id) {
				const ext = photoFile.name.split(".").pop();
				const path = `${profile.hostel_id}/${data.student_id}.${ext}`;
				const { error: uploadError } = await supabase.storage
					.from("student-photos")
					.upload(path, photoFile, { upsert: true });
				if (uploadError) throw uploadError;
			}

			setCredentials({
				email: loginEmail,
				password: tempPassword,
				name: values.name,
			});
			form.reset();
			setPhotoFile(null);
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Onboarding failed");
		} finally {
			setSubmitting(false);
		}
	}

	if (credentials) {
		return (
			<div className="space-y-4 border p-4">
				<p className="text-sm font-medium">
					{credentials.name} onboarded successfully.
				</p>
				<p className="text-sm text-muted-foreground">
					Share these login details with the student directly — they won't be
					shown again.
				</p>
				<div className="space-y-1 border p-3 text-sm">
					<p>
						<span className="font-medium">Login email:</span>{" "}
						{credentials.email}
					</p>
					<p>
						<span className="font-medium">Temporary password:</span>{" "}
						{credentials.password}
					</p>
				</div>
				<Button onClick={() => setCredentials(null)}>
					Onboard Another Student
				</Button>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Student full name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="guardian_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Guardian full name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="guardian_phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Student phone</FormLabel>
								<FormControl>
									<Input {...field} placeholder="024xxxxxxx" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="guardian_email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Student email (required)</FormLabel>
								<FormControl>
									<Input {...field} type="email" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="preferred_category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Preferred room category (optional)</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="No preference" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="Standard">Standard</SelectItem>
									<SelectItem value="Deluxe">Deluxe</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Actual room/bed assignment happens separately, after onboarding.
							</p>
						</FormItem>
					)}
				/>

				<div className="space-y-2">
					<FormLabel>Student photo</FormLabel>
					<PhotoUpload onFileSelected={setPhotoFile} />
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<Button
					type="submit"
					disabled={submitting}
					className="w-full sm:w-auto"
				>
					{submitting ? "Onboarding..." : "Onboard Student"}
				</Button>
			</form>
		</Form>
	);
}
