import { z } from "zod";

export const userSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email({ message: "Email is not valid" }).optional(),
    password: z.string().min(8, "Password should be minimum 8 characters long"),
    username: z.string().optional(),
  })
  .refine((input) => {
    if (input.email === undefined && input.username === undefined) return false;

    return true;
  });
