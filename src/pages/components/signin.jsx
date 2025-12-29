'use client';
import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        image: null,
    });

    const router = useRouter();

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setForm({ ...form, image: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", form.username);
            formData.append("email", form.email);
            formData.append("password", form.password);
            if (form.image) {
                formData.append("image", form.image);
            }

            const res = await fetch("/api/signup", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("🎉 একাউন্ট তৈরি সফল!", { position: "bottom-right" });
                setTimeout(() => router.push("/login"), 1500);
            } else {
                toast.error(data.message || "❌ সাইনআপ ব্যর্থ!");
            }

        } catch (error) {
            toast.error("⚠️ সার্ভার এরর!", { position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 sm:-mt-16 -mt-14">
            {/* 🔹 Card */}
            <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 border border-white/40 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">

                {/* 🔹 Top Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full shadow-md">
                        <FaUserPlus className="text-white text-3xl" />
                    </div>
                </div>

                {/* 🔹 Title */}
                <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-1">
                    ✨ Create Account
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    নতুন একাউন্ট তৈরি করুন
                </p>

                {/* 🔹 Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ইউজারনেম
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="nahid_hasan"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ইমেইল
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            পাসওয়ার্ড
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            প্রোফাইল ছবি (ঐচ্ছিক)
                        </label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full text-sm text-gray-600"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg text-white font-semibold flex justify-center items-center gap-2 transition-all duration-300 
                            ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {loading ? "একাউন্ট তৈরি হচ্ছে..." : "🚀 সাইনআপ"}
                    </button>
                </form>

                {/* 🔹 Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    ইতিমধ্যে একাউন্ট আছে?{" "}
                    <span
                        onClick={() => router.push("/login")}
                        className="text-green-600 font-medium cursor-pointer hover:underline"
                    >
                        লগইন করুন
                    </span>
                </p>
            </div>

            <ToastContainer position="bottom-right" />
        </div>
    );
}
