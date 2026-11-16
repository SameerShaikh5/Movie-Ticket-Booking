import mongoose from "mongoose";
import { ErrorHandler } from "../helpers/errorHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Screen } from "../models/screen.model.js";
import { Show } from "../models/show.model.js";
// CREATE SHOW
export const createShow = asyncHandler(async (req, res, next) => {
    const { movieTitle, posterImage, description, genre, language, rating, censor, screenId, format, startTime, runtime, standardTicketPrice, vipTicketPrice } = req.body;
    // 1. start time should be datetime
    let movieStartTime = new Date(startTime);
    if (isNaN(movieStartTime.getTime())) {
        return next(new ErrorHandler("Invalid startTime format. Provide a valid ISO date.", 400));
    }
    // 2. Movie end time calculation
    let movieEndTime = new Date(startTime);
    movieEndTime.setMinutes(movieEndTime.getMinutes() + runtime);
    // 3. check if screen is empty at that particular time
    const show = await Show.findOne({
        screenId,
        startTime: { $lt: movieEndTime },
        endTime: { $gt: movieStartTime },
        status: { $ne: "CANCELLED" }
    });
    if (show) {
        return next(new ErrorHandler("Screen not available!", 400));
    }
    // 3. fetch screen details
    const screen = await Screen.findOne({ _id: screenId, isActive: true });
    if (!screen) {
        return next(new ErrorHandler("Screen not found!!", 404));
    }
    // 4. create a show
    const newShow = await Show.create({
        movieTitle,
        posterImage,
        description,
        genre,
        format,
        language,
        rating,
        censor,
        screenId,
        startTime: movieStartTime,
        endTime: movieEndTime,
        runtime,
        pricing: {
            standard: standardTicketPrice, vip: vipTicketPrice
        },
        screenSnapShot: {
            name: screen.name,
            rows: screen.rows,
            columns: screen.columns,
            totalSeats: screen.totalSeats,
            standardRows: screen.standardRows,
            vipRows: screen.vipRows,
            validSeats: screen.validSeats
        }
    });
    return res.status(201).json({
        success: true,
        data: newShow,
        message: "Show created successfully!"
    });
});
// UPDATE SHOW BY ID
export const updateShowById = asyncHandler(async (req, res, next) => {
    const { movieTitle, description, posterImage, genre, language, rating, censor, screenId, format, startTime, runtime, standardTicketPrice, vipTicketPrice } = req.body;
    const { showId } = req.params;
    if (!showId) {
        return next(new ErrorHandler("showId is required!", 400));
    }
    // 1. retrieve the show from id
    const show = await Show.findById(showId);
    if (!show) {
        return next(new ErrorHandler("show not found!", 404));
    }
    // 2. dont update cancelled shows
    if (show.status === "CANCELLED") {
        return next(new ErrorHandler("Cancelled show cannot be updated!", 400));
    }
    const currDate = new Date();
    //3. check if show is already completed
    if (show.startTime < currDate) {
        return next(new ErrorHandler("Show has already closed!!", 400));
    }
    // 4. check if screen is changed
    const hasScreenChanged = show.screenId.toString() !== screenId;
    // 5. tickets are booked
    const hasTicketsBooked = show.bookedSeats.length > 0;
    // dont update if tickets for the show are booked
    if (hasTicketsBooked && hasScreenChanged) {
        return next(new ErrorHandler("Tickets are booked for the show. Cannot change the screens!", 400));
    }
    // 6. check startTime is valid
    const newStartTime = new Date(startTime);
    if (isNaN(newStartTime.getTime())) {
        return next(new ErrorHandler("Incorrect startTime!!", 400));
    }
    // 7. check if startTime is not in the past
    if (newStartTime < currDate) {
        return next(new ErrorHandler("startTime cannot be in the past!!", 400));
    }
    // 8. calculate new End time
    const newEndTime = new Date(newStartTime.getTime() + runtime * 60 * 1000);
    // 9. screensnapshot
    let screenSnapShot = show.screenSnapShot;
    // 10. if screen has changed and no tickets are booked for the show
    if (hasScreenChanged) {
        // check if screen exists
        const newScreen = await Screen.findOne({ _id: screenId, isActive: true });
        if (!newScreen) {
            return next(new ErrorHandler("New Screen not found!!", 404));
        }
        // change screensnapshot
        const newSnapShot = {
            name: newScreen.name,
            rows: newScreen.rows,
            columns: newScreen.columns,
            totalSeats: newScreen.totalSeats,
            standardRows: newScreen.standardRows,
            vipRows: newScreen.vipRows,
            validSeats: newScreen.validSeats
        };
        screenSnapShot = newSnapShot;
    }
    // 11. check if another show overlaps with the new show time
    const overlappingShow = await Show.findOne({
        screenId,
        endTime: { $gt: newStartTime },
        startTime: { $lt: newEndTime },
        _id: { $ne: show._id },
        status: { $ne: "CANCELLED" }
    });
    if (overlappingShow) {
        return next(new ErrorHandler("Screen is busy at that time. Screen is not available!!", 400));
    }
    // update the show
    show.movieTitle = movieTitle;
    show.posterImage = posterImage;
    show.genre = genre;
    show.language = language;
    show.rating = rating;
    show.format = format;
    show.description = description;
    show.censor = censor;
    show.screenId = new mongoose.Types.ObjectId(screenId);
    show.screenSnapShot = screenSnapShot;
    show.startTime = newStartTime;
    show.runtime = runtime;
    show.endTime = newEndTime;
    show.pricing = {
        standard: standardTicketPrice, vip: vipTicketPrice
    };
    // update the show by saving details
    const updatedShow = await show.save();
    return res.status(200).json({
        success: true,
        message: "Show updated successfully!",
        data: updatedShow
    });
});
// GET ALL SCHEDULED SHOWS
export const getAllShows = asyncHandler(async (req, res, next) => {
    let { movieTitle, page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    if (page < 1) {
        return next(new ErrorHandler("page number can't be less than 1.", 400));
    }
    if (limit < 1 || limit > 20) {
        return next(new ErrorHandler("limit can't be less than 1 and greater than 20.", 400));
    }
    // pagination logic
    let currPage = page - 1;
    const start = currPage * limit;
    let filter = { status: "SCHEDULED" };
    // if movietitle then trim it and add to filter
    if (movieTitle && movieTitle.trim()) {
        filter.movieTitle = { $regex: movieTitle, $options: "i" };
    }
    const [shows, totalShows] = await Promise.all([
        Show.find(filter).skip(start).limit(limit).sort({ createdAt: -1 }),
        Show.countDocuments(filter)
    ]);
    let totalPages = Math.ceil(totalShows / limit);
    if (shows.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                shows: [],
                totalShows,
                totalPages,
            },
            message: "No more shows available!",
        });
    }
    return res.status(200).json({
        success: true,
        data: {
            shows,
            totalShows,
            totalPages,
        },
        message: "Shows fetched successfully!",
    });
});
// GET SHOW BY ID
export const getShowById = asyncHandler(async (req, res, next) => {
    const { showId } = req.params;
    if (!showId) {
        return next(new ErrorHandler("showId not found!", 404));
    }
    // 1. find the show
    const show = await Show.findById(showId);
    if (!show) {
        return next(new ErrorHandler("Show not found!", 404));
    }
    return res.status(200).json({
        success: true,
        data: show,
        message: "Show fetched successfully!"
    });
});
// DELETE A SHOW
export const cancelShow = asyncHandler(async (req, res, next) => {
    const { showId } = req.params;
    if (!showId) {
        return next(new ErrorHandler("showId is required!", 400));
    }
    const show = await Show.findById(showId);
    if (!show) {
        return next(new ErrorHandler("Show not found!", 404));
    }
    // check if show is already completed
    if (new Date() > show.endTime) {
        return next(new ErrorHandler("Show is already completed!", 400));
    }
    // check if show is already cancelled
    if (show.status === "CANCELLED") {
        return next(new ErrorHandler("Show has already been cancelled!", 400));
    }
    // check if tickets are already booked for the show
    const hasTicketsBooked = show.bookedSeats.length > 0;
    if (!hasTicketsBooked) {
        const deletedShow = await Show.findByIdAndDelete(showId);
        return res.status(200).json({
            success: true,
            message: "No booking for the Show. Show deleted successfully!!",
            data: deletedShow
        });
    }
    // cancel the Show
    show.status = "CANCELLED";
    await show.save();
    return res.status(200).json({
        success: true,
        message: "Show Cancelled successfully!!",
        data: show
    });
});
