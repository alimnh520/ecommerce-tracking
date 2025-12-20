import jwt from "jsonwebtoken";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const isProduction = process.env.NODE_ENV === "production";

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    res.setHeader(
        "Set-Cookie",
        `muntaha-shop=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${isProduction ? "; Secure" : ""
        }`
    );

    return res.status(200).json({
        success: true,
        message: "Login successful!",
    });
}
