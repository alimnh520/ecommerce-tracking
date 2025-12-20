import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("Initializing Socket.IO server...");
        const io = new Server(res.socket.server);

        io.on("connection", (socket) => {
            console.log("New client connected:", socket.id);

            socket.on("sendMessage", (msg) => {
                io.emit("receiveMessage", msg);
            });

            socket.on("sendLocation", (location) => {
                io.emit("receiveLocation", location);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("Socket.IO already running");
    }

    res.end();
}
