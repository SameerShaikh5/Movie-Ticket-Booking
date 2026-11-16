// import mongoose, { Document, Model } from "mongoose"
import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: true
    },
    seats: [
        {
            seatNumber: { type: String, required: true },
            tier: { type: String, enum: ['STANDARD', 'VIP'], required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'PAYMENT_FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    razorpayOrderId: {
        type: String
    }
}, { timestamps: true });
export const Booking = mongoose.model("Booking", bookingSchema);
