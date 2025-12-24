import { getCollection } from "@/lib/mongoclient";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { senderId, receiverId, text, image } = req.body;

        if (!senderId || !receiverId || (!text && !image)) {
            return res.status(400).json({ success: false });
        }

        const messageCol = await getCollection("messages");
        const conversationCol = await getCollection("conversations");

        let conversation = await conversationCol.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            const newConv = {
                participants: [senderId, receiverId],
                unreadCount: { [receiverId]: 0 },
                createdAt: new Date(),
            };
            const result = await conversationCol.insertOne(newConv);
            conversation = { ...newConv, _id: result.insertedId };
        }

        const newMessage = {
            conversationId: conversation._id,
            senderId,
            receiverId,
            text: text || null,
            image: image || null,
            seen: false,
            createdAt: new Date(),
        };

        await messageCol.insertOne(newMessage);

        await conversationCol.updateOne(
            { _id: conversation._id },
            {
                $set: {
                    lastMessage: text || "📷 Image",
                    lastMessageAt: new Date(),
                },
                $inc: {
                    [`unreadCount.${receiverId}`]: 1,
                },
            }
        );

        const io = res.socket.server.io;
        if (io) {
            io.to(receiverId).emit("receiveMessage", newMessage);
        }

        return res.status(200).json({ success: true, message: newMessage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}
