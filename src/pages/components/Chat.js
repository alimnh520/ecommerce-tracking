"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Map from "./Map";

let socket;

export default function ChatWithMap() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        fetch("/api/socket");
        socket = io();

        socket.on("connect", () => console.log("Connected:", socket.id));

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("receiveLocation", (loc) => {
            setLocation(loc);
        });

        return () => socket.disconnect();
    }, []);

    const sendMessage = () => {
        if (!socket) return;
        socket.emit("sendMessage", message);
        setMessage("");
    };

    const shareLocation = () => {
        if (!socket) return;
        if (!navigator.geolocation) return alert("Geolocation not supported");

        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            socket.emit("sendLocation", loc);
        });
    };

    return (
        <div className="p-4 bg-gray-500">
            <div className="flex mb-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type message"
                    className="border p-2 flex-1"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white p-2 ml-2">
                    Send
                </button>
                <button onClick={shareLocation} className="bg-green-500 text-white p-2 ml-2">
                    Share Location
                </button>
            </div>

            <div className="mb-4">
                <h2 className="font-semibold">Messages:</h2>
                {messages.slice().reverse().map((m, i) => (
                    <div key={i}>{m}</div>
                ))}
            </div>

            {location && (
                <div>
                    <h2 className="font-semibold mb-2">Live Location:</h2>
                    <Map location={location} />
                </div>
            )}
        </div>
    );
}
