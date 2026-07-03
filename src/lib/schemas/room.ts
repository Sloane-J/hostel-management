import { z } from "zod";

export const createRoomSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  category: z.string().min(1, "Category is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(10, "Capacity seems too high"),
});

export type CreateRoomValues = z.infer<typeof createRoomSchema>;