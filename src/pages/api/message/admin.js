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

    if (!decodedUser) {
        return res.status(401).json({ error: "Unauthorized or invalid token" });
    }

    const userId = decodedUser.user_id;
    const adminId = "69540c8ce429874f0ece6bcf"; 

    if (req.method === "GET") {
        try {
            if (userId === adminId) {
                return res.status(403).json({
                    success: false,
                    message: "Admin does not need admin data"
                });
            }

            const collection = await getCollection("riders");

            const admin = await collection.findOne(
                { _id: new ObjectId(adminId) },
                { projection: { password: 0 } }
            );

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            return res.status(200).json({
                success: true,
                admin
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch admin"
            });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
