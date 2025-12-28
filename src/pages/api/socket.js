import { Server } from "socket.io";

let io;

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("Initializing Socket.IO...");
        io = new Server(res.socket.server, {
            path: "/api/socketio",
            cors: {
                origin: "*",
            },
        });

        // Online users mapping

        io.on("connection", (socket) => {
            console.log("✅ User connected:", socket.id);

            socket.on("join", ({ userId }) => {
                socket.join(userId);
                console.log("User joined room:", userId);
            });

            // Send message to a specific user
            socket.on("sendMessage", ({ receiverId, message }) => {
                io.to(receiverId).emit("receiveMessage", message);
            });

            socket.on("disconnect", () => {
                console.log("❌ User disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("Socket.IO already running");
    }
    res.end();
}
