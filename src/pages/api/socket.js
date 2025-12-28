import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("🟢 Socket server started");

        const io = new Server(res.socket.server, {
            path: "/api/socket",
            cors: {
                origin: "*",
            },
        });

        io.on("connection", (socket) => {

            socket.on("join", (data) => {
                const { userId } = data;
                console.log("userId is : ", userId);
                if (!userId) {
                    console.log("❌ userId missing");
                    return;
                }
                socket.join(userId);
            });

            socket.on("sendMessage", ({ message }) => {
                io.to(message.receiverId).emit("receiveMessage", message);
            });

            socket.on("disconnect", () => {
                console.log("❌ User disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
}
