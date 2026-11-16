import mongoose, { InferSchemaType } from "mongoose";

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: [15, "Screen name cannot exceed 15 characters"],
  },
  rows: {
    type: Number,
    required: true,
    min: [1, "Rows must be at least 1"],
    max: [26, "Rows cannot be greater than 26"],
  },
  columns: {
    type: Number,
    required: true,
    min: [1, "Columns must be at least 1"],
    max: [50, "Columns cannot be greater than 50"],
  },
  totalSeats: {
    type: Number,
    required: true,
    min: [1, "Total seats must be at least 1"],
  },
  formats:{
    type:[String],
    required:true,
    enum:["2D", "3D", "IMAX3D", "4DX"]
  },
  standardRows: {
    type: [String],
    required: true,
    default: [],
  },
  vipRows: {
    type: [String],
    required: true,
    default: [],
  },
  validSeats: {
    type: [String],
    required: true,
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export type ScreenType = InferSchemaType<typeof screenSchema>;

export const Screen = mongoose.model("Screen", screenSchema);