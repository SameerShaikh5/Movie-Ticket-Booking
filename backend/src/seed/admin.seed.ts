import dotenv from "dotenv"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";



dotenv.config()

const seedAdmin = async () => {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Missing admin seed environment variables");
    }

    try {
        await mongoose.connect(MONGO_URI);

        const email = ADMIN_EMAIL.trim().toLowerCase();
        const password = ADMIN_PASSWORD.trim()

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role !== "ADMIN") {
                console.warn(
                    "This email already belongs to a non-admin user. No changes made."
                );
            } else {
                console.log("Admin account already exists.");
            }

            return;
        }



        await User.create({
            name: process.env.ADMIN_NAME || "Admin",
            email,
            password,
            role: "ADMIN",
        });

        console.log("Admin account created successfully.");
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin().catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
});
