import { NextFunction, Response, Request } from "express"
import { ErrorHandler } from "../helpers/errorHandler.js"
import { ZodError } from "zod";
import jwt from "jsonwebtoken"


export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {

    let statusCode: number = 500;
    let message: string = err.message || "Server Error"
    if (err instanceof ErrorHandler) {
        statusCode = err.statusCode
    }

    if (err.name === "CastError") {
        message = "Invalid Id!"
        statusCode = 400
    }

    if (err instanceof ZodError) {
        statusCode = 400;

        message = err.issues
            .map((issue) => issue.message)
            .join(", ");
    }

    // JWT Error
    if (err instanceof jwt.TokenExpiredError) {
        statusCode = 401;
        message = "Login expired. Please log in again.";
    } else if (err instanceof jwt.JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }


    return res.status(statusCode).json({
        success: false,
        message: message
    })

}
