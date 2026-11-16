import { Redis } from "ioredis";
import { ErrorHandler } from "../helpers/errorHandler.js";
const port = Number(process.env.REDIS_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ErrorHandler("Invalid REDIS_PORT!", 500);
}
export const redis = new Redis({
    port: port,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
redis.on("connect", () => {
    console.log("Redis connected successfully.");
});
redis.on("error", (error) => {
    console.error("Redis error encountered:", error.message);
});
