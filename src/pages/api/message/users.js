import jwt from "jsonwebtoken";
import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";
import cookie from "cookie";

export default async function handler(req, res) {

    const verifyToken = (req) => {
        if (!req.headers.cookie) return null;
        const cookies = cookie.parse(req.headers.cookie);
        const token = cookies['chatting-web'];
        if (!token) return null;
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return null;
        }
    };

    const decodedUser = verifyToken(req);

    if (!decodedUser) return res.status(401).json({ error: "Unauthorized or invalid token" });
    const userId = decodedUser.user_id;

    if (req.method === "GET") {
        try {
            const adminId = "69540c8ce429874f0ece6bcf";
            const collection = await getCollection("riders");

            let users = [];

            if (String(userId) === String(adminId)) {
                users = await collection
                    .find({}, { projection: { password: 0 } })
                    .sort({ createdAt: -1 })
                    .toArray();
            } else {
                const admin = await collection.findOne(
                    { _id: new ObjectId(adminId) },
                    { projection: { password: 0 } }
                );

                users = admin ? [admin] : [];
            }

            return res.status(200).json({
                success: true,
                users
            });


        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });
        }
    }
}
