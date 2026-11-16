import { Payment } from "../models/payment.model.js";
import { Show } from "../models/show.model.js";
import { Screen } from "../models/screen.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
export const getAnalyticsData = asyncHandler(async (req, res, next) => {
    const { range = "all" } = req.query;
    // 1. Date filter helper with explicit typing
    const dateFilter = {};
    if (range === "today") {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter.createdAt = { $gte: startOfDay };
    }
    // Calculate Gross Revenue (Only PAID payments)
    const revenueMatch = { status: "PAID", ...dateFilter };
    const revenueResult = await Payment.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const grossRevenue = revenueResult[0]?.totalRevenue || 0;
    // 2. Calculate Occupancy & Tickets Sold
    const showFilter = range === "today" ? {
        startTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
    } : {};
    const shows = await Show.find({ ...showFilter, status: "SCHEDULED" });
    let totalSeatsCapacity = 0;
    let totalBookedSeatsCount = 0;
    let totalTicketsSold = 0;
    // Explicitly typed performance record map
    const moviePerformanceMap = {};
    shows.forEach((show) => {
        const capacity = show.screenSnapShot?.totalSeats || 0;
        const bookedCount = show.bookedSeats?.length || 0;
        totalSeatsCapacity += capacity;
        totalBookedSeatsCount += bookedCount;
        totalTicketsSold += bookedCount;
        if (!moviePerformanceMap[show.movieTitle]) {
            moviePerformanceMap[show.movieTitle] = {
                title: show.movieTitle,
                format: show.format,
                tickets: 0,
                revenue: 0,
                capacitySum: 0,
                bookedSum: 0
            };
        }
        const movieEntry = moviePerformanceMap[show.movieTitle];
        movieEntry.tickets += bookedCount;
        movieEntry.capacitySum += capacity;
        movieEntry.bookedSum += bookedCount;
        const avgPrice = (show.pricing.standard + show.pricing.vip) / 2;
        movieEntry.revenue += bookedCount * avgPrice;
    });
    const averageOccupancy = totalSeatsCapacity > 0
        ? ((totalBookedSeatsCount / totalSeatsCapacity) * 100).toFixed(1)
        : 0;
    // 3. Active Auditorium Count
    const activeScreensCount = await Screen.countDocuments({ isActive: true });
    // 4. Format Top Movies into ranked array with explicit type mapping
    const topMovies = Object.values(moviePerformanceMap)
        .map((m, index) => ({
        rank: index + 1,
        title: m.title,
        format: m.format,
        tickets: m.tickets,
        occupancy: m.capacitySum > 0 ? `${Math.round((m.bookedSum / m.capacitySum) * 100)}%` : '0%',
        revenue: `₹${m.revenue.toLocaleString('en-IN')}`
    }))
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, 3);
    res.status(200).json({
        success: true,
        data: {
            grossRevenue: `₹${grossRevenue.toLocaleString('en-IN')}`,
            averageOccupancy: `${averageOccupancy}%`,
            totalTickets: `${totalTicketsSold} Seats`,
            activeScreens: `${activeScreensCount} Screens`,
            topMovies
        }
    });
});
