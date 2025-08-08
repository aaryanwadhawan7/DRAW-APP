import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"

declare module 'express' {
    interface Request {
        userId?: string;
    }
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized! No token provided..." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Token might be undefiend or invalid!"
        })
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
            req.userId = (decoded as jwt.JwtPayload).userId as string;
            return next();
        }
        return res.status(401).json({ message: "Unauthorized access" });
    } catch (error) {
        // Don't expose error.message for auth errors
        return res.status(401).json({ message: "Unauthorized" });
    }
}
