import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/TicketBooking?retryWrites=false";
        // Force append if it's missing from your env string
        const finalUri = uri.includes("retryWrites=") ? uri : `${uri}?retryWrites=false`;
        const conn = await mongoose.connect(finalUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
