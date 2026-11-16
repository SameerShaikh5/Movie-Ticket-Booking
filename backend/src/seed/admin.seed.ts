import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const seedAdmin = async (): Promise<void> => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("Skipping admin seeding: ADMIN_EMAIL or ADMIN_PASSWORD not set.");
    return;
  }

  try {
    // Wait for connectDB() to finish establishing the connection
    await mongoose.connection.asPromise();

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const password = ADMIN_PASSWORD.trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "ADMIN") {
        console.warn(
          `Admin seed skipped: ${email} already belongs to a non-admin user.`
        );
      } else {
        console.log("Admin account verified.");
      }
      return;
    }

    await User.create({
      name: (ADMIN_NAME || "Admin").trim(),
      email,
      password, // Assumes your User model's pre('save') hook hashes the password
      role: "ADMIN",
    });

    console.log("Admin account created successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Admin seeding failed:", error.message);
    } else {
      console.error("Admin seeding failed:", error);
    }
  }
};