import { ErrorHandler } from "../helpers/errorHandler.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "./asyncHandler.middleware.js";
import jwt from "jsonwebtoken";

interface TokenData {
    _id: string,
    email: string,
    role: string,
}

export const auth = (authorizedRoles: string[]) => asyncHandler(async (req, res, next) => {

    const token = req.cookies.token

    if (!token) {
        return next(new ErrorHandler("Login Required!", 401))
    }

    const secretKey = process.env.JWT_SECRET

    if (!secretKey) {
        throw new Error("JWT_SECRET is not configured in env")
    }

    const tokenData = jwt.verify(token, secretKey) as TokenData
    const user = await User.findById(tokenData._id).select(" _id name email role")


    if (!user) {
        return next(new ErrorHandler("Unauthorized!", 401))
    }

    if (!authorizedRoles.includes(user.role)) {
        return next(new ErrorHandler("Forbidden!", 403))
    }

    req.user = user

    next()

})