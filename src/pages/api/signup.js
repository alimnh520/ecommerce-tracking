import { connectDB } from "@/lib/connectDb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();

        const formData = await req.formData();

        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const imageFile = formData.get("image");

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "সব ফিল্ড আবশ্যক" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "এই ইমেইল আগে থেকেই আছে" },
                { status: 409 }
            );
        }

        // const hashedPassword = await bcrypt.hash(password, 10);

        let imageUrl = "";
        let imageId = "";

        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "users",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result);
                        }
                    )
                    .end(buffer);
            });

            imageUrl = uploadResult.secure_url;
            imageId = uploadResult.public_id;
        }

        await User.create({
            username,
            email,
            password,
            image: imageUrl,
            imageId
        });

        return NextResponse.json(
            { success: true, message: "একাউন্ট তৈরি সফল" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json(
            { message: "সার্ভার এরর" },
            { status: 500 }
        );
    }
}
