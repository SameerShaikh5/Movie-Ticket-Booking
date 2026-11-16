import { ErrorHandler } from "../helpers/errorHandler.js";
import { generateSeats } from "../helpers/generateSeats.helper.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Screen } from "../models/screen.model.js";
import { Show } from "../models/show.model.js";
// CREATE SCREEN
export const createScreen = asyncHandler(async (req, res, next) => {
    let { name, rows, columns, formats, vipRows } = req.body;
    // 1. check for existing screen
    const existingScreen = await Screen.findOne({ name });
    if (existingScreen) {
        return next(new ErrorHandler("Screen name already exists!", 400));
    }
    // 2. generate seats
    const validSeats = generateSeats(rows, columns);
    // 3. calculate totalSeats
    const totalSeats = rows * columns;
    // 4. create standard/vip row arrays
    const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // rows array
    const rowsArr = ALPHABETS.slice(0, rows);
    // check if a vip row entered is invalid
    const invalidRow = vipRows.find((r) => !rowsArr.includes(r));
    if (invalidRow) {
        return next(new ErrorHandler(`Invalid VIP row: "${invalidRow}". Allowed rows are ${rowsArr[0]} to ${rowsArr[rowsArr.length - 1]}.`, 400));
    }
    // filter standard rows
    const standardRows = rowsArr.filter((r) => !vipRows.includes(r));
    // 5. create a screen
    const screen = await Screen.create({
        name,
        rows,
        columns,
        totalSeats,
        formats,
        standardRows,
        vipRows: vipRows,
        validSeats,
    });
    return res.status(201).json({
        success: true,
        data: screen,
        message: 'Screen created successfully'
    });
});
// UPDATE SCREEN BY ID
export const updateScreen = asyncHandler(async (req, res, next) => {
    let { name, rows, columns, formats, vipRows } = req.body;
    const { screenId } = req.params;
    if (!screenId) {
        return next(new ErrorHandler('screenId is required!', 404));
    }
    // 1. Verify screen exists
    const screen = await Screen.findOne({ _id: screenId, isActive: true });
    if (!screen) {
        return next(new ErrorHandler('Screen not found!', 404));
    }
    // 2. Check if this SPECIFIC screen has upcoming shows
    const upcomingShow = await Show.findOne({
        screenId: screenId,
        startTime: { $gt: new Date() },
        status: { $ne: "CANCELLED" }
    });
    if (upcomingShow) {
        return next(new ErrorHandler("A show is scheduled on this screen. It cannot be updated.", 400));
    }
    // 3. Name uniqueness check (ignore self)
    const existingScreen = await Screen.findOne({
        name,
        _id: { $ne: screenId },
    });
    if (existingScreen) {
        return next(new ErrorHandler('Screen name already in use by another screen!', 409));
    }
    // 4.  Generate seats
    const validSeats = generateSeats(rows, columns);
    // calculate total seats
    const totalSeats = rows * columns;
    // 5. create standard and vip rows
    const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const rowsArr = ALPHABETS.slice(0, rows);
    // check if vip rows are invalid
    const invalidRow = vipRows.find((r) => !rowsArr.includes(r));
    if (invalidRow) {
        return next(new ErrorHandler(`Invalid VIP row: "${invalidRow}". Allowed rows are ${rowsArr[0]} to ${rowsArr[rowsArr.length - 1]}.`, 400));
    }
    // create standard rows array
    const standardRows = rowsArr.filter((r) => !vipRows.includes(r));
    // 6. Update and retrieve the fresh document atomically
    const updatedScreen = await Screen.findByIdAndUpdate(screenId, {
        name,
        rows,
        columns,
        formats,
        totalSeats,
        standardRows,
        vipRows: vipRows,
        validSeats
    }, { returnDocument: 'after', runValidators: true });
    return res.status(200).json({
        success: true,
        message: "Screen Updated Successfully!!",
        data: updatedScreen
    });
});
// DELETE SCREEN
export const deleteScreen = asyncHandler(async (req, res, next) => {
    const { screenId } = req.params;
    // 1. check if screen id exists
    if (!screenId) {
        return next(new ErrorHandler("screenId is required!", 404));
    }
    // 2. Verify screen exists
    const screen = await Screen.findById(screenId);
    if (!screen) {
        return next(new ErrorHandler('Screen not found!', 404));
    }
    if (!screen.isActive) {
        return next(new ErrorHandler('Screen is already deactivated!', 400));
    }
    // 3. Check if this SPECIFIC screen has upcoming shows
    const upcomingShow = await Show.findOne({
        screenId: screenId,
        startTime: { $gt: new Date() },
        status: { $ne: "CANCELLED" }
    });
    if (upcomingShow) {
        return next(new ErrorHandler("A show is scheduled on this screen. It cannot be deleted.", 400));
    }
    // 4. mark screen as inactive
    screen.isActive = false;
    await screen.save();
    return res.status(200).json({
        success: true,
        data: screen,
        message: "Screen Deactivated Successfully!!"
    });
});
// GET ALLSCREENS
export const getAllScreens = asyncHandler(async (req, res, next) => {
    const screens = await Screen.find({ isActive: true });
    if (screens.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No screens exists!",
            data: screens
        });
    }
    return res.status(200).json({
        success: true,
        data: screens,
        message: "Screens fetched successfully!",
    });
});
// GET SCREEN BY ID
export const getScreen = asyncHandler(async (req, res, next) => {
    const { screenId } = req.params;
    // 1. check if screen is parsed
    if (!screenId) {
        return next(new ErrorHandler("screenId is required!", 404));
    }
    // 2. check if screen exists and is active
    const screen = await Screen.findOne({ _id: screenId, isActive: true });
    if (!screen) {
        return next(new ErrorHandler("Screen not found!", 404));
    }
    return res.status(200).json({
        success: true,
        data: screen
    });
});
