import express from "express";
import { getAnalyticsData } from "../controllers/analytics.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.get("/", auth(["ADMIN"]), getAnalyticsData);
export const analyticsRoutes = router;
