import { Screen } from "../models/screen.model.js";
import mongoose from "mongoose";
import { Show } from "../models/show.model.js";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
async function seedDatabase() {
    try {
        if (!MONGO_URI) {
            throw new Error("Missing admin seed environment variables");
        }
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");
        // Clear existing data
        console.log("Clearing existing screens and shows...");
        await Screen.deleteMany({});
        await Show.deleteMany({});
        // 1. Create Screens
        console.log("Seeding screens...");
        const screen1 = await Screen.create({
            name: "Screen 1",
            rows: 5,
            columns: 10,
            totalSeats: 50,
            formats: ["2D", "3D"],
            standardRows: ["A", "B", "C"],
            vipRows: ["D", "E"],
            validSeats: ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2"],
            isActive: true,
        });
        const screen2 = await Screen.create({
            name: "IMAX Hall",
            rows: 4,
            columns: 8,
            totalSeats: 32,
            formats: ["IMAX3D", "4DX"],
            standardRows: ["A", "B"],
            vipRows: ["C", "D"],
            validSeats: ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"],
            isActive: true,
        });
        // 2. Create Shows using screen references and snapshots
        console.log("Seeding shows...");
        const now = new Date("2026-11-14T15:00:00+05:30");
        const later = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
        await Show.create([
            {
                movieTitle: "Interstellar Odyssey",
                posterImage: "https://example.com/posters/interstellar.jpg",
                description: "A breathtaking journey beyond the galaxy exploring wormholes and survival.",
                genre: ["Sci-Fi", "Drama"],
                language: "English",
                format: "IMAX3D",
                rating: 8.9,
                censor: "UA",
                screenId: screen2._id,
                screenSnapShot: {
                    name: screen2.name,
                    rows: screen2.rows,
                    columns: screen2.columns,
                    totalSeats: screen2.totalSeats,
                    standardRows: screen2.standardRows,
                    vipRows: screen2.vipRows,
                    validSeats: screen2.validSeats,
                },
                startTime: now,
                endTime: later,
                runtime: 169,
                pricing: {
                    standard: 350,
                    vip: 650,
                },
                bookedSeats: ["C1", "C2"],
                status: "SCHEDULED",
            },
            {
                movieTitle: "The Comedy Club",
                posterImage: "https://example.com/posters/comedy.jpg",
                description: "A hilarious laugh riot featuring top stand-up comedians.",
                genre: ["Comedy"],
                language: "English",
                format: "2D",
                rating: 7.5,
                censor: "U",
                screenId: screen1._id,
                screenSnapShot: {
                    name: screen1.name,
                    rows: screen1.rows,
                    columns: screen1.columns,
                    totalSeats: screen1.totalSeats,
                    standardRows: screen1.standardRows,
                    vipRows: screen1.vipRows,
                    validSeats: screen1.validSeats,
                },
                startTime: now,
                endTime: later,
                runtime: 120,
                pricing: {
                    standard: 200,
                    vip: 400,
                },
                bookedSeats: [],
                status: "SCHEDULED",
            }
        ]);
        console.log("Database seeded successfully!");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}
seedDatabase();
