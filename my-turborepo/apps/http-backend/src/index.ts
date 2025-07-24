import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
const app = express();
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from '@repo/db/client';


app.use(express.json());


// signin, signup and create-room endpoint

// username -> email (unique)
// password 
// name
app.post('/signup', async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            "message": "Invalid inputs"
        })
        return;
    }

    try {

        const userPassword = parsedData.data.password;
        const noOfSaltRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, noOfSaltRounds);

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                password: hashedPassword,
                name: parsedData.data.name
            }
        })

        res.json({
            "userId": user.id
        })
    } catch (error) {
        res.status(403).json({
            "message": "User already exist with username."
        })
    }
})


app.post('/signin', async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid inputs" });
        return;
    }

    try {
        // Find user by email only
        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username, // assuming username is email
            },
        });

        if (!user) {
            return res.status(403).json({ message: "User doesn't exist!" });
        }

        // Compare hashed password stored in DB with plaintext password from request
        const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        // Password is valid — create JWT token
        const token = jwt.sign(
            {
                userId: user.id, // Usually use user ID inside JWT, not email
            },
            JWT_SECRET
        );

        return res.json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Signin failed!" });
    }
});


// user will be able join or create a room if it authorized
// req.userId = (decoded as jwt.JWTPayload).userId as string
app.post('/room', middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            "message": "Invalid inputs"
        })
        return;
    }

    // db call
    try {
        // slug 
        // adminId

        // @ts-ignore
        const userId = req.userId;

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            "roomId": room.id
        })
    } catch (error: any) {
        res.status(403).json({
            "message": error.message
        })
    }
})

app.get('/chats/:roomId', async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: 'desc'
            },
            take: 50
        })

        res.json({
            messages
        })
    } catch (error: any) {
        res.json({
            error: error.message
        })
    }
})

app.listen(3001, () => {
    console.log("Express application is running on port 3001.");
})


