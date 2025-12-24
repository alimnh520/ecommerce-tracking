import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("🔌 Initializing Socket.IO server...");

        const io = new Server(res.socket.server, {
            path: "/api/socket",
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log("✅ Client connected:", socket.id);

            socket.on("join", (receiverId) => {
                if (!receiverId) return;
                socket.join(receiverId);
            });

            socket.on("disconnect", () => {
                console.log("❌ Client disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("⚡ Socket.IO already running");
    }

    res.end();
}
