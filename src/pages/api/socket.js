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

            socket.on("join", ({ userId }) => {
                socket.join(userId);
            });

            socket.on("sendMessage", ({ message }) => {
                io.to(message.receiverId).emit("receiveMessage", message);
            });

            socket.on("seenMessage", ({ conversationId, senderId }) => {
                io.to(senderId).emit("seenMessage", { conversationId });
            });

            // 📞 CALL EVENTS
            socket.on("call-user", ({ from, to, type }) => {
                io.to(to).emit("incoming-call", { from, type });
            });

            socket.on("accept-call", ({ from, to }) => {
                io.to(to).emit("call-accepted", { from });
            });

            socket.on("reject-call", ({ from, to }) => {
                io.to(to).emit("call-rejected", { from });
            });

        });


        res.socket.server.io = io;
    }

    res.end();
}
