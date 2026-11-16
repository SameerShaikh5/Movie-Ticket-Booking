import z from "zod";
import xss from "xss";
import sanitize from "mongo-sanitize";

const clean = (val: string) =>
  xss(sanitize(val).trim())

export const showBodySchema = z.object({
  body: z.object({
    movieTitle: z
      .string()
      .transform(clean)
      .refine((val) => val.length >= 1, "Movie title is required")
      .refine(
        (val) => val.length <= 100,
        "Movie title cannot exceed 100 characters"
      ),

    posterImage: z
      .string()
      .trim()
      .min(1, "Poster image is required"),
    // .url("Poster image must be a valid URL")

    genre: z
      .array(z.string(), { required_error: "Genre is required" })
      .min(1, "At least one genre must be specified"),

    language: z
      .string({ required_error: "Language is required" })
      .min(1, "Language cannot be empty"),

    rating: z
      .number({ required_error: "Rating is required" })
      .min(0, "Rating cannot be less than 0")
      .max(10, "Rating cannot exceed 10"),

    censor: z
      .string(),
    format: z.string().min(1, "Format is required"),
    description: z.string().max(300, "description cannot exceed 300 characters").min(10, "description should be atleast 10 characters long"),
    screenId: z
      .string()
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid screen ID"),

    startTime: z
      .string().trim()
      .refine(
        (value) => new Date(value) > new Date(),
        "Start time must be in the future"
      ),

    runtime: z
      .number()
      .int("Runtime must be an integer")
      .min(1, "Runtime must be at least 1 minute"),

    standardTicketPrice: z
      .number()
      .min(0, "Standard ticket price cannot be negative")
      .max(10000, "Standard ticket price cannot exceed 10000"),

    vipTicketPrice: z
      .number()
      .min(0, "VIP ticket price cannot be negative")
      .max(10000, "VIP ticket price cannot exceed 10000"),
  })
})


export const showQuerySchema = z.object({
  movieTitle: z
    .string()
    .transform(clean)
    .optional(),

  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});


export type ShowData = z.infer<typeof showBodySchema>;
