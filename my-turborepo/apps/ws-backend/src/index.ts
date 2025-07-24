import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
const wss = new WebSocketServer({ port: 8080 });
import { prismaClient } from "@repo/db/client";

interface User {
    userId: string,
    rooms: string[],
    ws: WebSocket,
};


/*
Our global variable will look like this
[[
    ws : Websocket,
    rooms : ["room1", "room2"],
    userId : "1"
],
[
    ws : WebSocket,
    rooms : [],
    userId : "2"
]]
*/


const users: User[] = [];


function removeUser(ws: WebSocket) {
    const index = users.findIndex(x => x.ws === ws);
    if (index != -1) {
        users.splice(index, 1);
        console.log(`User removed. Active number of users : ${users.length}`);
    }
}


function findUser(ws: WebSocket) {
    return users.find(x => x.ws === ws);
}


// TODO : Write Logic for statefull backend
wss.on('connection', function connection(ws, Request) {
    const url = Request.url;
    if (!url) {
        return;
    }

    const queryString = url.includes("?") ? url.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const token = queryParams.get("token") || "";
    if (!token) {
        ws.close(1008, "Missing token");
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
        ws.close();
        return;
    }

    try {
        if (typeof decoded === 'object' && decoded != null && ("userId" in decoded)) {
            const userIdRaw = (decoded as any).userId;
            const userId: string = String(userIdRaw);
            if (userId === null) {
                ws.close();
                return;
            }

            const newUser: User = {
                userId,
                rooms: [],
                ws
            }

            users.push(
                newUser
            )

            //ws.close logic
            ws.on('close', function handler(code, reason) {
                console.log(`userId : ${code} disconnected from the room due to ${reason}`);
                removeUser(ws);
            })

            //ws.error logic 
            ws.on('error', (error: Error) => {
                console.log(`WebSocket error for user ${userId} due to ${error.message}`);
                removeUser(ws);
            })

            // join-room, send-chat, leave-room Logic...
            ws.on('message', async function message(data) {

                const parsedData = JSON.parse(data as unknown as string); // {type : "join-room", roomId : "1221"}
                // Before parsedData.type = "join-room" or "leave-room" or "chat", we had to make sure that user already exists
                const user = findUser(ws);
                if (user && parsedData.roomId) {
                    if (parsedData.type === "join-room") {
                        // Check if user is already present in the room or not
                        if (!user.rooms.includes(parsedData.roomId)) {
                            user?.rooms.push(parsedData.roomId);
                            console.log(`${user.userId} joined ${parsedData.roomId}.`);
                        } else {
                            console.log(`${user.userId} already exists in the room ${parsedData.roomId}`);
                            return;
                        }
                    }

                    if (parsedData.type === "leave-room") { // {type : "leave-room", roomId : "12213"}
                        // Check if user is present in this room or not
                        if (user?.rooms.includes(parsedData.roomId)) {
                            user?.rooms.filter(x => x !== parsedData.roomId)
                        } else {
                            console.log(`${user.userId} haven't joined the room yet!`);
                            return;
                        }
                    }
                }


                if (parsedData.type === "chat") { // {types : "chat", message : "hi there", roomId : "1221"}
                    const roomId = parsedData.roomId;
                    const message = parsedData.message;

                    if (roomId && message) {

                        if (user?.rooms.includes(roomId)) {

                            await prismaClient.chat.create({
                                data: {
                                    roomId,
                                    message,
                                    userId
                                }
                            })
                            users.forEach((user) => {
                                if (user.ws.readyState === WebSocket.OPEN) {
                                    user.ws.send(JSON.stringify({
                                        type: "chat",
                                        message: message,
                                        roomId: roomId,
                                        userId: userId
                                    })
                                    )
                                }
                            })
                        }
                    }
                }
            })
        }
    } catch (error: any) {
        // TO FIX BUG
        console.log(error.message)
    }

})


console.log("WebSocket is running on port 8080.");