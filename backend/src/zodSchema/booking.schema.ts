import z from "zod";
import xss from "xss";
import sanitize from "mongo-sanitize";

const clean = (val: string) =>
    xss(sanitize(val).trim());

export const CreateBookingSchema = z.object({
    body: z.object({
        seats: z
            .array(
                z.string()
                    .trim()
                    .regex(
                        /^[A-Z]\d+$/,
                        "Invalid seat number!"
                    )
            )
            .min(1, "At least one seat must be selected")
            .refine(
                (seats) => new Set(seats).size === seats.length,
                "Duplicate seats are not allowed"
            ),

        showId: z
            .string()
            .regex(/^[a-fA-F0-9]{24}$/, "Invalid show ID"),
    })
});

export type BookingInput = z.infer<typeof CreateBookingSchema>


export const VerifyPaymentSchema = z.object({
    body: z.object({
        razorpay_payment_id: z
            .string()
            .trim()
            .min(1, "Payment ID is required")
            .max(200, "Payment ID is too long")
            .transform(clean),

        razorpay_order_id: z
            .string()
            .trim()
            .min(1, "Order ID is required")
            .max(200, "Order ID is too long")
            .transform(clean),

        razorpay_signature: z
            .string()
            .trim()
            .min(1, "Payment signature is required")
            .max(300, "Payment signature is too long")
            .transform(clean)
    })
})

