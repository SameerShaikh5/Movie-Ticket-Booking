import mongoose from "mongoose";
const showSchema = new mongoose.Schema({
    movieTitle: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, "Movie Title cannot exceed 100 characters"]
    },
    posterImage: {
        type: String, required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: [500, "description should be less than 500 characters"]
    },
    genre: {
        type: [String],
        required: true,
    },
    language: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true,
        enum: ["2D", "3D", "IMAX3D", "4DX"]
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    censor: {
        type: String,
        required: true
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true,
    },
    screenSnapShot: {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        rows: {
            type: Number,
            required: true
        },
        columns: {
            type: Number,
            required: true
        },
        totalSeats: {
            type: Number,
            required: true,
        },
        standardRows: {
            type: [String],
            required: true,
            default: []
        },
        vipRows: {
            type: [String],
            required: true,
            default: []
        },
        validSeats: {
            type: [String], required: true, default: []
        }
    },
    startTime: {
        type: Date, required: true
    },
    endTime: {
        type: Date, required: true
    },
    runtime: {
        type: Number,
        required: true,
        min: 1
    },
    pricing: {
        standard: { type: Number, required: true, min: 0, max: 10000 },
        vip: { type: Number, required: true, min: 0, max: 10000 },
    },
    bookedSeats: { type: [String], default: [] },
    status: {
        type: String,
        default: "SCHEDULED",
        enum: ["SCHEDULED", "CANCELLED"]
    }
}, { timestamps: true });
export const Show = mongoose.model('Show', showSchema);
