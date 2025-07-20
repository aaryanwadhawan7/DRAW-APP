import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
const app = express ();
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"

// signin, signup and create-room endpoint
app.post ('/signup', (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        res.json ({
            "message" : "Invalid inputs"
        })
        return;
    }
})


app.post ('/signin', (req, res) => {
    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
        res.json ({
            "message" : "Invalid inputs"
        })
        return;
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json ({
        token
    })
})


// user will be able join or create a room if it authorized
// req.userId = (decoded as jwt.JWTPayload).userId as string
app.post ('/room',middleware , (req, res) => {
   const data = CreateRoomSchema.safeParse(req.body);
   if (!data.success) {
    res.json ({
        "message" : "Invalid inputs"
    })
    return;
   }
   
    // db call

    res.json ({
        room : 123
    })
})


app.listen (3001, () => {
    console.log ("Express application is running on port 3001.");
})


