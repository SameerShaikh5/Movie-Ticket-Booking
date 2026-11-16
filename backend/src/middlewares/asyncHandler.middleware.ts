import { NextFunction, Request, Response } from "express";

export const asyncHandler = (
    handler: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    }
}

