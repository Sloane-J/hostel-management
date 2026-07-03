import { z } from "zod";

export const studentOnboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  guardian_name: z.string().min(2, "Guardian name is required"),
  guardian_phone: z
    .string()
    .min(9, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Numbers only"),
  guardian_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  preferred_category: z.string().optional(),
});

export type StudentOnboardingValues = z.infer<typeof studentOnboardingSchema>;