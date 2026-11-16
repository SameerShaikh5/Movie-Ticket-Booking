import z from "zod";
import xss from "xss";
import sanitize from "mongo-sanitize";
// Helper function for sanitization
const clean = (val) => (typeof val === "string" ? xss(sanitize(val)) : val);
export const ScreenSchema = z.object({
    body: z.object({
        name: z
            .string()
            .transform((val) => clean(val.trim()))
            .pipe(z.string()
            .min(1, "Screen name is required")
            .max(15, "Screen name cannot exceed 15 characters")),
        rows: z
            .number()
            .int("Rows must be an integer")
            .min(1, "Rows must be at least 1")
            .max(26, "Rows cannot exceed 26"),
        columns: z
            .number()
            .int("Columns must be an integer")
            .min(1, "Columns must be at least 1")
            .max(50, "Columns cannot exceed 50"),
        formats: z
            .array(z.enum(["2D", "3D", "IMAX3D", "4DX"], {
            errorMap: () => ({ message: "Invalid format type selected" }),
        }), { required_error: "Formats are required" })
            .min(1, "At least one format must be specified"),
        vipRows: z
            .array(z.string().trim().toUpperCase().regex(/^[A-Z]$/, "Each VIP row must be a single uppercase letter (A-Z)"))
            .min(1, "At least one VIP row is required")
            .refine((rows) => new Set(rows).size === rows.length, "VIP rows cannot contain duplicates"),
    })
});
