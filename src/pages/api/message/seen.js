import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
        return res.status(400).json({ success: false, message: "conversationId and userId required" });
    }

    try {
        const convId = new ObjectId(conversationId);
        const messageCol = await getCollection("messages");

        const updateResult = await messageCol.updateMany(
            {
                conversationId: convId,
                receiverId: userId,
                seen: false
            },
            { $set: { seen: true, seenAt: new Date() } }
        );

        const seenMessages = await messageCol.find({
            conversationId: convId,
            receiverId: userId
        }).toArray();

        if (global.io) {
            global.io.to(conversationId.toString()).emit("messagesSeen", { conversationId, userId });
        }

        return res.status(200).json({ success: true, seenMessages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
