import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"

declare module 'express' {
    interface Request {
        userId?: string;
    }
}

export function middleware(req: Request, res: Response, next: NextFunction) {

    try {
        // this retrieves the token from the authorization header
        const token = req.headers["authorization"] ?? "";

        // JWT -> HEADER(algorithm type).PAYLOAD(actual data).SIGNATURE(verification of token)
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded && typeof decoded === "object" && "userId" in decoded) {
            // token retrieved is decoded via SECRET_KEY
            req.userId = (decoded as jwt.JwtPayload).userId as string;
            next();
        } else {
            res.status(403).json({
                "message": "Unauthorized access"
            })
        }
    } catch (error: any) {
        res.json({
            "error": error.message
        })
    }

}