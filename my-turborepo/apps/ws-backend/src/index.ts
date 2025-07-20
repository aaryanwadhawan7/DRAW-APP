import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
const wss = new WebSocketServer({ port : 8080 });


wss.on ('connection', function connection (ws, Request) {
    const url = Request.url;
    if (!url) {
        return;
    }

    const queryString = url.includes("?") ? url.split("?")[1] : "";
    const queryParams = new URLSearchParams(queryString);
    const token = queryParams.get("token");
    if (!token) {
        ws.close(1008, "Missing token");
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
        ws.close ();
        return;
    }

    ws.on('message', function message (data) {
        ws.send ("pong");
    }) 
})