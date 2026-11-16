import express from "express";
import { cancelShow, createShow, getAllShows, getShowById, updateShowById } from "../controllers/show.controller.js";
import { validation } from "../middlewares/validation.middleware.js";
import { showBodySchema, showQuerySchema } from "../zodSchema/show.schema.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router()



router.post("/", auth(["ADMIN"]), validation(showBodySchema), createShow)

router.get("/", validation(showQuerySchema), getAllShows)

router.get("/:showId", getShowById)

router.put("/:showId", auth(["ADMIN"]), validation(showBodySchema), updateShowById)

router.patch("/:showId", auth(["ADMIN"]), cancelShow)


export const showRoutes = router 