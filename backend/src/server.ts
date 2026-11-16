import express, { Request, Response } from "express"
import dotenv from "dotenv";
import { connectDB } from "./configs/database.config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"
import { userRoutes } from "./routes/user.routes.js";
import { showRoutes } from "./routes/show.routes.js";
import { screenRoutes } from "./routes/screen.routes.js";
import { bookingRoutes } from "./routes/booking.routes.js";
import cors from "cors"
import { analyticsRoutes } from "./routes/analytics.routes.js";
import helmet from "helmet";
import { seedAdmin } from "./seed/admin.seed.js";




dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// database connection
connectDB()

// seed admin
seedAdmin()

// redis connection

app.use(cookieParser())
app.use(express.json())
app.use(helmet())

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
         // Exact frontend URL (no trailing slash)
        credentials: true,             // Required for cookies to be accepted by browser
    })
)

app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Server is Running"
    })
})


// routes
app.use('/api/v1/users', userRoutes)

app.use('/api/v1/shows', showRoutes)

app.use('/api/v1/screens', screenRoutes)

app.use('/api/v1/bookings', bookingRoutes)

app.use('/api/v1/analytics', analyticsRoutes)


app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})