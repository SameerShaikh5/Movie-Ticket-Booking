import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ErrorHandler } from "../helpers/errorHandler.js";



// user registeration
export const registerUser = asyncHandler(async (req, res, next) => {

    const { name, email, password } = req.body


    // check for existing user
    const existingUser = await User.findOne({ email: email })
    if (existingUser) {
        return next(new ErrorHandler("Email already exists!", 400))
    }


    // create user
    const user = await User.create({
        name,
        email,
        password
    })

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured")
    }

    // create jwt token
    const token = jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    )

    // set the token in cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
})



// Login User
export const loginUser = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    // find user
    const user = await User.findOne({ email: email })
    if (!user) {
        return next(new ErrorHandler("Email doesn't exists!", 404))
    }

    // verify password
    const result = await bcrypt.compare(password, user.password)
    if (!result) {
        return next(new ErrorHandler("Incorrect Password!", 400))
    }

    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured")
    }

    const token = jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
})


// User Profile
export const userProfile = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user?._id).select("-password")
    if (!user) {
        return next(new ErrorHandler("User not found!", 404))
    }

    return res.status(200).json({
        success: true,
        message: "User profile fetched successfully!",
        data: user
    })
}
)



// login health check
export const checkLogin = asyncHandler(async (req, res, next) => {

    return res.status(200).json({
        success: true,
        message: "User authenticated",
        data: req.user
    })
}
)


// logout user
export const logoutUser = asyncHandler(async (req, res, next) => {

    res.clearCookie("token")

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    })
}
)

// update user
export const updateUser = asyncHandler(async (req, res, next) => {

    const {name, password} = req.body

    const user = await User.findById(req.user?._id)
    if(!user){
        return next(new ErrorHandler("User not found.", 404))
    }
    
    if (name !== undefined) {
        user.name = name;
    }

    if (password) {
        user.password = password;
    }

    await user.save();


    return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
}
)
