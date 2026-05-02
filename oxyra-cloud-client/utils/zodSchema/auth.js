import { z } from "zod";

export const baseSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = baseSchema.extend({
  name: z.string().min(1, "Name is required"),
});