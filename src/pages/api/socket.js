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

        io.on('connection', (socket) => {
            socket.on('join', ({ userId }) => {
                socket.join(userId);
            });

            socket.on('sendMessage', ({ message }) => {
                const receiverId = message.receiverId;
                io.to(receiverId).emit('receiveMessage', message);
            });

            socket.on("seenMessage", ({ conversationId, senderId }) => {
                io.to(senderId).emit("seenMessage", {
                    conversationId
                });
            });

            socket.on("unreadMessage", ({ conversationId, senderId }) => {
                io.to(senderId).emit("unreadMessage", {
                    conversationId
                });
            });

        });

        res.socket.server.io = io;
    }

    res.end();
}
