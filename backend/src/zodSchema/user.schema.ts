import z from "zod";
import xss from "xss";
import sanitize from "mongo-sanitize";

// Helper function for sanitization
const clean = (val: string) => (typeof val === "string" ? xss(sanitize(val)) : val);

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "At least 1 character is required in name")
      .max(100, "Name cannot be 100 characters long")
      .transform(clean),
    
    email: z
      .string()
      .trim()
      .toLowerCase() // Automatically normalize email to lowercase
      .email("Invalid email address")
      .min(3, "Email is too short!")
      .max(254, "Email is too long!")
      .transform(clean),
    
    password: z
      .string()
      .min(6, "Minimum 6 character password is required")
      .max(100, "Password is too long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"), // Fixed z.email() -> z.string().email()
    
    password: z
      .string()
      .min(6, "Minimum 6 character password is required")
      .max(100),
  }),
});

// Infer input types for controllers/services
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];