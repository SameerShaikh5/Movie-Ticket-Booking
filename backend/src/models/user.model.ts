import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 254,
        minlength: 3,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
        trim: true
    },
}, { timestamps: true });


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

export type ScreenType = InferSchemaType<typeof userSchema>;

export const User = mongoose.model("User", userSchema);