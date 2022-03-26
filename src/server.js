import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import res from "express/lib/response";
import { Socket } from "dgram";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
    console.log("Admin pannel on https://admin.socket.io/");
};

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(wsServer, {
    auth: false,
});

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    const set = new Set(publicRooms);
    return [...set];
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    wsServer.sockets.emit("room_change", publicRooms());
    socket["nickname"] = "Anon";
    console.log("Connected✅");
    socket.onAny((event) => {
        console.log(`${socket.id}'s Socket Event: ${event}`);
    });
    socket.on("enter_room", (nickName, roomName, done) => {
        socket.join(roomName);
        socket.nickname = nickName;
        done(countRoom(roomName));
        socket
            .to(roomName)
            .emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname, done) => {
        socket.rooms.forEach((room) =>
            socket
                .to(room)
                .emit(
                    "modified",
                    `${socket.nickname}'s nickname is changed to ${nickname}`
                )
        );
        socket["nickname"] = nickname;
        done(nickname);
    });
});

httpServer.listen(3000, handleListen);

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("connected");
//     socket.on("close", () => {
//         console.log("Disconnected from the browser");
//     });
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => {
//                     if (socket !== aSocket)
//                         aSocket.send(`${socket.nickname}: ${message.payload}`);
//                 });
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//             default:
//                 break;
//         }
//     });
// });

