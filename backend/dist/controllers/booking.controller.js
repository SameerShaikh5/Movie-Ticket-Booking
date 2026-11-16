import mongoose from "mongoose";
import { razorpayInstance } from "../configs/razorpay.config.js";
import { redis } from "../configs/redis.config.js";
import { ErrorHandler } from "../helpers/errorHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Show } from "../models/show.model.js";
import { lockSeatsScript } from "../utils/lockSeatsScript.utils.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { releaseSeatsScript } from "../utils/releaseSeatsScript.utils.js";
// CREATE BOOKING
export const createBooking = asyncHandler(async (req, res, next) => {
    const { seats, showId } = req.body;
    const user = req.user;
    if (!user) {
        return next(new ErrorHandler("user is required!", 400));
    }
    // 1. find show
    const show = await Show.findById(showId);
    if (!show) {
        return next(new ErrorHandler("Show not found!", 404));
    }
    // 2. check if seats are locked in redis
    for (const seat of seats) {
        const existing = await redis.get(`lock:${seat}:showId:${showId}`);
        if (existing) {
            return next(new ErrorHandler(`Seat ${seat} is locked by another user!`, 400));
        }
    }
    // 3. check seats validity from db
    const invalidSeat = seats.find((seat) => !show.screenSnapShot.validSeats.includes(seat));
    if (invalidSeat) {
        return next(new ErrorHandler(`Seat ${invalidSeat} is invalid!`, 400));
    }
    // 4. check if seats are booked
    const alreadyBookedSeat = seats.find((seat) => show.bookedSeats.includes(seat));
    if (alreadyBookedSeat) {
        return next(new ErrorHandler(`Seat ${alreadyBookedSeat} is already booked!`, 400));
    }
    let totalAmount = 0;
    const selectedSeats = [];
    for (const seat of seats) {
        const isVip = show.screenSnapShot.vipRows.includes(seat.slice(0, 1));
        const price = isVip
            ? show.pricing.vip
            : show.pricing.standard;
        selectedSeats.push({
            seatNumber: seat,
            tier: isVip ? "VIP" : "STANDARD",
            price
        });
        totalAmount += price;
    }
    // 5. lock all seats atomically
    const lockKeys = seats.map((seat) => `lock:${seat}:showId:${showId}`);
    const result = await redis.eval(lockSeatsScript, lockKeys.length, ...lockKeys, user._id.toString(), "600");
    if (result === 0) {
        return next(new ErrorHandler("One or more selected seats are already locked!", 409));
    }
    const newBooking = await Booking.create({
        userId: user._id,
        showId: show._id,
        seats: selectedSeats,
        totalAmount,
        status: "PENDING"
    });
    const totalAmountPaise = totalAmount * 100;
    const options = {
        amount: totalAmountPaise,
        currency: "INR",
        receipt: `order_${newBooking._id}`
    };
    const razorpayOrder = await razorpayInstance.orders.create(options);
    newBooking.razorpayOrderId = razorpayOrder.id;
    await newBooking.save();
    return res.status(201).json({
        success: true,
        message: "Order Created successfully!",
        data: {
            razorpayOrder,
            newBooking
        }
    });
});
export const verifyPayment = async (req, res, next) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const user = req.user;
    if (!user) {
        return next(new ErrorHandler("user is required!", 400));
    }
    // 1. verify Razorpay signature
    const isValid = validatePaymentVerification({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
    }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);
    if (!isValid) {
        return next(new ErrorHandler("Payment Verification Failed!", 400));
    }
    // 2. fetch payment from Razorpay
    const razorpayPayment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    if (!razorpayPayment) {
        return next(new ErrorHandler("Payment not found!", 404));
    }
    // 3. payment must be captured before booking
    if (razorpayPayment.status !== "captured") {
        // release Redis locks belonging to this booking later
        return next(new ErrorHandler(`Payment is not captured. Current status: ${razorpayPayment.status}`, 400));
    }
    // 4. find booking
    const booking = await Booking.findOne({
        razorpayOrderId: razorpay_order_id,
        userId: user._id
    });
    if (!booking) {
        return next(new ErrorHandler("Booking not found!", 404));
    }
    // 5. prevent duplicate verification
    if (booking.status !== "PENDING") {
        return next(new ErrorHandler("Booking is already processed!", 400));
    }
    // 6. verify payment amount
    const expectedAmount = booking.totalAmount * 100;
    if (razorpayPayment.amount !== expectedAmount) {
        return next(new ErrorHandler("Payment amount does not match booking amount!", 400));
    }
    // 7. start transaction
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            //  seats from booking
            const newBookedSeats = booking.seats.map((seat) => seat.seatNumber);
            // 8. book seats only if none of them are already booked
            const updatedShow = await Show.findOneAndUpdate({
                _id: booking.showId,
                bookedSeats: {
                    $nin: newBookedSeats
                }
            }, {
                $addToSet: {
                    bookedSeats: {
                        $each: newBookedSeats
                    }
                }
            }, {
                new: true,
                session
            });
            // seats were taken by someone else
            if (!updatedShow) {
                throw new Error("SEATS_NOT_AVAILABLE");
            }
            // confirm booking
            booking.status = "CONFIRMED";
            await booking.save({ session });
            // create payment record
            await Payment.create([{
                    razorpay_order_id,
                    razorpay_signature,
                    razorpay_payment_id,
                    bookingId: booking._id,
                    userId: user._id,
                    status: "PAID"
                }], {
                session
            });
        });
        // transaction succeeded
        // now release Redis locks
        const releaseKeys = booking.seats.map((seat) => `lock:${seat.seatNumber}:showId:${booking.showId}`);
        await redis.eval(releaseSeatsScript, releaseKeys.length, ...releaseKeys);
        return res.status(200).json({
            success: true,
            message: "Payment verified and booking confirmed!",
            data: {
                booking
            }
        });
    }
    catch (error) {
        // release Redis locks even when booking fails
        const releaseKeys = booking.seats.map((seat) => `lock:${seat.seatNumber}:showId:${booking.showId}`);
        await redis.eval(releaseSeatsScript, releaseKeys.length, ...releaseKeys);
        // payment was already captured but seats became unavailable
        if (error instanceof Error &&
            error.message === "SEATS_NOT_AVAILABLE") {
            // This is now a captured payment.
            // Therefore this is a REFUND case.
            await razorpayInstance.payments.refund(razorpay_payment_id, {
                amount: booking.totalAmount * 100
            });
            return next(new ErrorHandler("Seats are no longer available. Payment will be refunded.", 409));
        }
        return next(error);
    }
    finally {
        await session.endSession();
    }
};
export const cancelBooking = asyncHandler(async (req, res, next) => {
    const { bookingId } = req.params;
    if (!bookingId) {
        return next(new ErrorHandler("bookingId is required!", 400));
    }
    // 1. Find Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return next(new ErrorHandler("Booking not found!", 404));
    }
    // 2. Check if booking is in CONFIRMED state
    if (booking.status !== "CONFIRMED") {
        return next(new ErrorHandler(`Booking is in ${booking.status} status and cannot be cancelled!`, 400));
    }
    // 3. Find Show
    const show = await Show.findById(booking.showId);
    if (!show) {
        return next(new ErrorHandler("Show not found!", 404));
    }
    const currDate = new Date();
    // 4. Validate Show Timing & 1-Hour Cancellation Window
    const CANCELLATION_DEADLINE_MS = 60 * 60 * 1000; // 1 Hour
    const timeUntilShow = new Date(show.startTime).getTime() - currDate.getTime();
    if (currDate >= new Date(show.endTime)) {
        return next(new ErrorHandler("Show is already completed!", 400));
    }
    if (timeUntilShow < CANCELLATION_DEADLINE_MS) {
        return next(new ErrorHandler("Bookings cannot be cancelled within 1 hour of showtime or while running!", 400));
    }
    // 5. Find Payment Record
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
        return next(new ErrorHandler("Associated payment record not found!", 404));
    }
    // 6. Trigger Gateway Refund via Razorpay API
    const refund = await razorpayInstance.payments.refund(payment.razorpay_payment_id, {
        amount: Math.round(booking.totalAmount * 100), // Amount in paise
        notes: {
            reason: "User cancelled booking",
            bookingId: booking._id.toString()
        }
    });
    // 7. Update Booking Status
    booking.status = "CANCELLED";
    await booking.save();
    // 8. Atomically remove seats from show.bookedSeats to release inventory back to the pool
    await Show.updateOne({ _id: show._id }, { $pull: { bookedSeats: { $in: booking.seats } } });
    // 9. Update Payment Status to REFUNDED
    payment.status = "REFUNDED";
    await payment.save();
    return res.status(200).json({
        success: true,
        message: "Booking cancelled and refund processed successfully!",
        data: {
            bookingId: booking._id,
            seatsReleased: booking.seats,
            refundId: refund.id,
            amountRefunded: booking.totalAmount
        }
    });
});
// GET BOOKING DETAILS
export const bookingDetailsById = asyncHandler(async (req, res, next) => {
    const { bookingId } = req.params;
    const user = req.user;
    if (!bookingId) {
        return next(new ErrorHandler("bookingId is required!", 400));
    }
    const booking = await Booking.findOne({ _id: bookingId, userId: user._id }).populate("showId");
    if (!booking) {
        return next(new ErrorHandler("booking not found!", 400));
    }
    return res.status(200).json({
        success: true,
        message: "booking details fetched successfully!",
        data: booking
    });
});
// GET ALL BOOKINGS
export const allUserBookings = asyncHandler(async (req, res, next) => {
    const user = req.user;
    let { limit, page } = req.query;
    // Parse query parameters with default values
    const currentPage = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (currentPage - 1) * pageLimit;
    const [bookings, totalBookings] = await Promise.all([
        Booking.find({ userId: user._id, status: { $ne: "PENDING" } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .populate({
            path: "showId",
            select: "-screenSnapShot -pricing",
            populate: {
                path: "screenId",
                select: "name"
            }
        }),
        Booking.countDocuments({ userId: user._id })
    ]);
    const totalPages = Math.ceil(totalBookings / pageLimit);
    return res.status(200).json({
        success: true,
        message: "Bookings fetched successfully!",
        data: {
            bookings,
            totalBookings,
            totalPages,
            currentPage,
            limit: pageLimit
        }
    });
});
// Release seats
export const cancelIncompleteBooking = asyncHandler(async (req, res, next) => {
    const { bookingId } = req.body;
    const user = req.user;
    if (!bookingId) {
        return next(new ErrorHandler("Booking ID is required!", 400));
    }
    const booking = await Booking.findOne({
        _id: bookingId,
        userId: user._id,
        status: "PENDING"
    });
    if (!booking) {
        return res.status(200).json({
            success: true,
            message: "No pending booking found to release."
        });
    }
    // 1. Mark booking as CANCELLED
    booking.status = "CANCELLED";
    await booking.save();
    // 2. Map correctly using seat.seatNumber from your booking schema
    const releaseKeys = booking.seats.map((seat) => `lock:${seat.seatNumber}:showId:${booking.showId}`);
    console.log("Releasing Redis lock keys for cancelled booking:", releaseKeys);
    if (releaseKeys.length > 0) {
        await redis.eval(releaseSeatsScript, releaseKeys.length, ...releaseKeys);
    }
    return res.status(200).json({
        success: true,
        message: "Booking cancelled and seats released successfully."
    });
});
