import express from "express";
import http from "http";
import WebSocket from "ws";
import res from "express/lib/response";
import { Socket } from "dgram";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("connected");
    socket.on("close", () => {
        console.log("Disconnected from the browser");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) => {
                    if (socket !== aSocket)
                        aSocket.send(`${socket.nickname}: ${message.payload}`);
                });
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
            default:
                break;
        }
    });
});

server.listen(3000, handleListen);
