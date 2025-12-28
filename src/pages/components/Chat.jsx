'use client';

import { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import { IoIosArrowBack } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { FaImage, FaSearchLocation } from "react-icons/fa";
import Link from "next/link";

import { UserContext } from "../Provider";
import { io } from "socket.io-client";

export default function Chat() {
    const { user } = useContext(UserContext);
    const [allUser, setAllUser] = useState([]);
    const [history, setHistory] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [messages, setMessages] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [isSearch, setIsSearch] = useState(false);
    const [fullView, setFullView] = useState(true);
    const [mobileView, setMobileView] = useState(true);

    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const socketRef = useRef(null);

    useEffect(() => {
        if (!user?._id) return;

        socketRef.current = io({
            path: "/api/socket",
        });

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join", { userId: user._id });
        });

        socketRef.current.on("receiveMessage", (msg) => {
            updateHistoryFromMessage(msg);
        });

        return () => {
            socketRef.current.disconnect();
        };

    }, [user]);


    const updateHistoryFromMessage = (msg) => {
        console.log('message id is : ', msg);
        setMessages(prev => [...prev, msg]);
        setHistory(prev => {
            const otherUserId =
                msg.senderId === user._id ? msg.receiverId : msg.senderId;

            const old = prev.find(h => h.userId === otherUserId);

            const userInfo =
                old ||
                allUser.find(u => u._id === otherUserId);

            const newEntry = {
                _id: msg.conversationId || old?._id || Date.now(),
                userId: otherUserId,
                username: userInfo?.username || "Unknown",
                image: userInfo?.image || "/avatar.png",
                participants: [msg.senderId, msg.receiverId],
                lastMessage: msg.text || "📷 Image",
                lastMessageAt: msg.createdAt,
                unread:
                    msg.senderId === user._id
                        ? 0
                        : (old?.unread || 0) + 1
            };

            const filtered = prev.filter(h => h.userId !== otherUserId);

            return [newEntry, ...filtered];
        });
    };

    const handleSendMessage = async () => {
        if (!user?._id) return;
        if (!input && !file) return;

        if (file) {
            const MAX_SIZE = 20 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                alert("File size must be less than 20MB");
                return;
            }
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
                "video/mp4",
                "video/webm",
                "video/quicktime"
            ];
            if (!allowedTypes.includes(file.type)) {
                alert("Only image and video files are allowed");
                return;
            }
        }

        let file_url = null;
        let file_id = null;

        if (file) {
            setIsUploading(true); // start loading

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ml_default");
            formData.append("folder", "images");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/auto/upload`,
                { method: "POST", body: formData }
            );

            const uploadResult = await response.json();
            setIsUploading(false); // stop loading

            if (!uploadResult.secure_url) {
                alert("Upload failed");
                return;
            }

            file_url = uploadResult.secure_url;
            file_id = uploadResult.public_id;
        }

        try {
            const res = await fetch("/api/message/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: user._id,
                    receiverId: chatUser?.userId,
                    text: input || null,
                    file_url,
                    file_id
                }),
            });

            const data = await res.json();

            if (data.success) {
                setInput('');
                setFile(null);
                socketRef.current.emit("sendMessage", { message: data.message });
                updateHistoryFromMessage(data.message);
            }

        } catch (err) {
            console.error("Send message error:", err);
        }
    };


    useEffect(() => {

        if (!chatUser?._id) {
            setMessages([]);
            return;
        }

        const fetchMessage = async () => {
            const res = await fetch('/api/message/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: chatUser?._id })
            });

            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        };

        fetchMessage();
    }, [chatUser?._id]);


    useEffect(() => {
        if (!user?._id) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/message/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user._id }),
                });
                const data = await res.json();
                setHistory(data?.history);
                setChatUser(data?.history[0])
            } catch (err) {
                console.error(err);
                setHistory([]);
            }
        };
        fetchHistory();
    }, [user?._id]);


    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const res = await fetch('/api/message/users');
                const data = await res.json();
                setAllUser(data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchAllUsers();
    }, []);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const filteredUsers = allUser.filter(u =>
        u.username.toLowerCase().includes(searchInput.toLowerCase()) && u._id !== user?._id
    );


    return (
        <div className="h-screen w-full bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-4 text-black">
            <div className="mx-auto h-full max-w-5xl rounded-2xl bg-gray-400 shadow-xl overflow-hidden flex">

                <aside className={`${fullView ? 'sm:w-80' : 'sm:w-0'} ${mobileView ? 'w-full' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 backdrop-blur`}>
                    <div className="p-4 pb-2">
                        <h2 className="text-xl font-semibold">Chats</h2>
                        <div className="mt-3 relative">
                            <input
                                type="text"
                                placeholder="Search Messenger"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={searchInput}
                                onFocus={() => setIsSearch(true)}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                            {isSearch && (
                                <div className="absolute top-10 left-0 w-full max-h-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 pb-10 overflow-y-auto z-10">
                                    <button className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white size-8 flex items-center justify-center rounded-full" onClick={() => setIsSearch(false)}>
                                        <ImCross />
                                    </button>

                                    {filteredUsers.map(u => (
                                        <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                const conv = history.find(v => v.userId === u._id);

                                                if (conv) {
                                                    setChatUser(conv);
                                                } else {
                                                    setChatUser({
                                                        _id: null,
                                                        userId: u._id,
                                                        username: u.username,
                                                        image: u.image,
                                                        participants: [user._id, u._id]
                                                    });

                                                    setMessages([]);
                                                }
                                                setMobileView(false);
                                                setIsSearch(false);
                                            }}
                                        >
                                            <img src={u.image} alt={u.username} className="h-10 w-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-medium">{u._id === user?._id ? 'You' : u.username}</p>
                                                <p className="text-xs text-gray-500">{u.online ? "Active now" : "Offline"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-[calc(100%-92px)] overflow-y-auto">
                        {history.map(conv => {
                            const unread = conv.unread || 0;

                            const lastMsgDate = conv.lastMessageAt
                                ? new Date(conv.lastMessageAt)
                                : new Date();

                            const today = new Date();
                            const isToday =
                                lastMsgDate.getDate() === today.getDate() &&
                                lastMsgDate.getMonth() === today.getMonth() &&
                                lastMsgDate.getFullYear() === today.getFullYear();

                            return (
                                <button
                                    key={conv.userId}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50
        ${conv.userId === chatUser?.userId ? "bg-indigo-50" : ""}`}
                                    onClick={() => {
                                        setChatUser(conv);
                                        setMobileView(false);
                                    }}
                                >
                                    <img
                                        src={conv.image}
                                        alt={conv.username}
                                        className="h-11 w-11 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex flex-col">
                                        <p className="truncate font-medium">{conv.username}</p>

                                        <div className={`flex items-center gap-2 ${conv.participants[0] !== user?._id && 'gap-2'}`}>
                                            {conv.participants[0] !== user?._id && (<p className="truncate text-xs text-gray-500 max-w-28">
                                                {conv.lastMessage}
                                            </p>)}

                                            <p className="text-[10px] text-gray-400">
                                                {isToday
                                                    ? lastMsgDate.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : lastMsgDate.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {unread > 0 && (
                                        <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                            {unread}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                    </div>
                </aside>

                {chatUser && (<main className={`sm:flex-1 flex flex-col transition-all duration-300 w-0 overflow-hidden ${mobileView ? 'w-0' : 'w-full'}`}>

                    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 px-5 py-3 backdrop-blur">
                        <IoIosArrowBack className={`text-2xl ${fullView ? 'rotate-0' : 'rotate-180'} transition-all duration-300 cursor-pointer`} onClick={() => {
                            setFullView(!fullView);
                            setMobileView(true);
                        }} />
                        {chatUser && (
                            <>
                                <img src={chatUser.image} className="h-10 w-10 rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold">{chatUser.username}</p>
                                    <p className="text-xs text-gray-500">{chatUser.online ? "Active now" : "Offline"}</p>
                                </div>
                            </>
                        )}

                        <Link href={`/components/location/${chatUser?.userId}`} className="cursor-pointer self-end ml-auto ">
                            <FaSearchLocation className="text-gray-600 text-4xl hover:text-indigo-500" />
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pl-2 scrollbar" ref={scrollRef}>
                        {messages?.map(msg => {
                            const isSender = msg.senderId === user._id;
                            return (
                                <div key={msg._id} className={`mb-2 flex sendmessage ${isSender ? "justify-end" : "justify-start"}`}>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-start justify-start gap-1">
                                            {!isSender && <img src={chatUser.image} alt="user" className="w-5 h-5 mt-px rounded-full object-center object-cover" />}
                                            <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${isSender ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                                                {msg.text && <p className="break-words">{msg.text}</p>}
                                                {msg.file_url && <img src={msg.file_url} alt="sent" className="mt-2 max-w-xs rounded-lg" />}
                                                <div className="mt-1 text-[10px] select-none flex justify-between items-center">
                                                    <span>{moment(msg.createdAt).format("h:mm A")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isSender && (
                                            <span className="ml-2 text-[10px] font-semibold">
                                                {msg.seen ? "Read" : "Unread"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Composer */}
                    <div className="border-t border-gray-200 p-3">
                        <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-2 ring-1 ring-gray-200 relative">

                            {/* Image Preview */}
                            {file && (
                                <div className="relative w-32 h-32">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => setFile(null)}
                                        className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
                                    >
                                        <ImCross className="text-sm" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <textarea
                                    rows={1}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Aa"
                                    className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="hidden"
                                    id="fileInput"
                                />
                                <label htmlFor="fileInput" className="cursor-pointer self-center flex items-center justify-center">
                                    <FaImage className="text-gray-600 text-3xl hover:text-indigo-500" />
                                </label>
                                <button
                                    className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white ${input || file ? 'bg-indigo-700' : 'bg-indigo-500 pointer-events-none'}`}
                                    onClick={handleSendMessage}
                                    disabled={isUploading} // disable button during upload
                                >
                                    {isUploading ? "Uploading..." : "Send"}
                                </button>

                            </div>
                        </div>
                    </div>

                </main>)}


            </div >
        </div >
    )
}
