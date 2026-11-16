import mongoose from "mongoose"
import { IncomingHttpStatusHeader } from "node:http2"

interface AuthUser {
    _id: mongoose.Types.ObjectId,
    email:string,
    role: 'USER' | 'ADMIN'
}

declare global {
    namespace Express {
        interface Request {
            user?:AuthUser
        }
    }
}

export {}