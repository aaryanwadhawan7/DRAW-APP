import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
const app = express ();
import { middleware } from "./middleware";

// signin, signup and create-room endpoint
app.post ('/signin', (req, res) => {
    // userId, password -> Validation by Zod
})

app.post ('/signup', (req, res) => {


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
    // db call

    res.json ({
        room : 123
    })
})


app.listen (3001, () => {
    console.log ("Express application is running on port 3001.");
})


