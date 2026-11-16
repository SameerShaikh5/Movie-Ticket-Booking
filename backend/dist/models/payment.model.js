import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    razorpay_order_id: {
        type: String
    },
    razorpay_payment_id: {
        type: String,
        unique: true
    },
    razorpay_signature: {
        type: String
    },
    totalAmount: {
        type: Number
    },
    status: {
        type: String,
        enum: ["PENDING", "FAILED", "PAID", "REFUNDED"]
    }
}, { timestamps: true });
export const Payment = mongoose.model("Payment", paymentSchema);
