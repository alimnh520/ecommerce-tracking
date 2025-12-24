// "use client";

import Chat from "./components/Chat";

// import { useContext, useEffect, useRef, useState } from "react";
// import moment from "moment";
// import { IoIosArrowBack } from "react-icons/io";
// import { ImCross } from "react-icons/im";
// import { FaImage, FaSearchLocation } from "react-icons/fa";
// import Link from "next/link";
// import { UserContext } from "./Provider";

// export default function MessengerDesktop() {
//   const { user } = useContext(UserContext);
//   const [allUser, setAllUser] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [isSearch, setIsSearch] = useState(false);
//   const [fullView, setFullView] = useState(true);
//   const [chatUser, setChatUser] = useState(null);
//   const [conversationId, setConversationId] = useState(null);

//   const [input, setInput] = useState("");
//   const [file, setFile] = useState(null);



//   useEffect(() => {
//     if (!user?._id) return;
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch("/api/message/users", { method: "GET" });
//         const data = await res.json();
//         setAllUser(data.users.filter(u => u._id !== user._id));
//       } catch (err) {
//         console.error(err);
//         setAllUser([]);
//       }
//     };
//     fetchUsers();

//     const fetchHistory = async () => {
//       try {
//         const res = await fetch("/api/message/history", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ user_id: user._id }),
//         });

//         const data = await res.json();
//         setHistory(data.history);

//         if (data.history.length > 0) {
//           const firstConv = data.history[0];

//           setChatUser({
//             _id: firstConv.userId,
//             username: firstConv.username,
//             image: firstConv.image,
//             online: firstConv.online || false,
//           });

//           setConversationId(firstConv._id);
//         }
//       } catch (err) {
//         console.error(err);
//         setHistory([]);
//       }
//     };

//     fetchHistory();
//   }, [user?._id]);

//   useEffect(() => {
//     if (!conversationId) {
//       setMessages([]);
//       return;
//     }

//     const fetchMessages = async () => {
//       try {
//         const res = await fetch("/api/message/messages", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ conversationId }),
//         });

//         const data = await res.json();
//         setMessages(data.messages);
//       } catch (err) {
//         console.error("Fetch messages error:", err);
//         setMessages([]);
//       }
//     };
//     fetchMessages();

//     const readMessages = async () => {
//       await fetch("/api/message/seen", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ conversationId, userId: user._id }),
//       });
//     }
//     readMessages();

//     const updateUnreadCount = async () => {
//       await fetch("/api/message/unread", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ conversationId, userId: user._id })
//       });
//     }
//     updateUnreadCount();

//   }, [conversationId]);


//   // auto scroll to bottom
//   const scrollRef = useRef(null);
//   useEffect(() => {
//     if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//   }, [messages]);


//   // search filter
//   const filteredUsers = allUser.filter(u =>
//     u.username.toLowerCase().includes(searchInput.toLowerCase())
//   );

//   // send message handler
//   const handleSendMessage = async () => {
//     if (!input && !file) return;
//     if (!chatUser?._id) return;

//     const receiverId = chatUser._id;

//     // optimistic history update
//     setHistory(prev => {
//       const filtered = prev.filter(h => h.userId !== receiverId);

//       const newConv = {
//         _id: conversationId || `temp-${Date.now()}`,
//         userId: receiverId,
//         username: chatUser.username,
//         image: chatUser.image,
//         lastMessage: input,
//         lastMessageAt: new Date(),
//         unreadCount: {},
//       };

//       return [newConv, ...filtered];
//     });

//     setInput("");
//     setFile(null);

//     try {
//       const res = await fetch("/api/message/send", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           senderId: user._id,
//           receiverId,
//           text: input || null,
//         }),
//       });

//       const data = await res.json();

//       if (data.conversationId) {
//         setConversationId(data.conversationId);
//       }

//     } catch (err) {
//       console.error("Send message error:", err);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] text-white">
//         <div className="size-20 rounded-full border-8 border-blue-600 border-t-transparent animate-spin"/>
//       </div>
//     );
//   }


//   return (
//     <div className="h-screen w-full bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-4 text-black">
//       <div className="mx-auto h-full max-w-5xl rounded-2xl bg-white/95 shadow-xl overflow-hidden flex">

//         {/* Sidebar */}
//         <aside className={`${fullView ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white/70 backdrop-blur`}>
//           <div className="p-4 pb-2">
//             <h2 className="text-xl font-semibold">Chats</h2>
//             <div className="mt-3 relative">
//               <input
//                 type="text"
//                 placeholder="Search Messenger"
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
//                 value={searchInput}
//                 onFocus={() => setIsSearch(true)}
//                 onChange={e => setSearchInput(e.target.value)}
//               />
//               {isSearch && (
//                 <div className="absolute top-10 left-0 w-full max-h-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 pb-10 overflow-y-auto z-10">
//                   <button className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white size-8 flex items-center justify-center rounded-full" onClick={() => setIsSearch(false)}>
//                     <ImCross />
//                   </button>
//                   {filteredUsers.map(u => (
//                     <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
//                       onClick={() => {
//                         setChatUser({
//                           _id: u._id,
//                           username: u.username,
//                           image: u.image,
//                           online: u.online
//                         });
//                         setConversationId(null); // নতুন chat
//                         setIsSearch(false);
//                       }}

//                     >
//                       <img src={u.image} alt={u.username} className="h-10 w-10 rounded-full object-cover" />
//                       <div>
//                         <p className="font-medium">{u.username}</p>
//                         <p className="text-xs text-gray-500">{u.online ? "Active now" : "Offline"}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="h-[calc(100%-92px)] overflow-y-auto">
//             {history.map(conv => {
//               const unread = conv.unreadCount ? conv.unreadCount[user._id] || 0 : 0;

//               let lastMsgDate = new Date(conv.lastMessageAt);
//               if (isNaN(lastMsgDate.getTime())) {
//                 lastMsgDate = new Date();
//               }

//               const today = new Date();
//               const isToday =
//                 lastMsgDate.getDate() === today.getDate() &&
//                 lastMsgDate.getMonth() === today.getMonth() &&
//                 lastMsgDate.getFullYear() === today.getFullYear();

//               return (
//                 <button
//                   key={conv._id}
//                   className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left ${chatUser?._id === conv.userId ? "bg-indigo-50" : ""
//                     }`}
//                   onClick={() => {
//                     setChatUser({
//                       _id: conv.userId,
//                       username: conv.username,
//                       image: conv.image,
//                       online: conv.online || false,
//                     });
//                     setConversationId(conv._id);
//                   }}
//                 >

//                   <img src={conv.image} className="h-11 w-11 rounded-full object-cover" />
//                   <div className="min-w-0 flex flex-col">
//                     <p className="truncate font-medium">{conv.username}</p>
//                     <div className="flex items-center gap-2">
//                       {unread > 0 && <p className="truncate text-xs text-gray-500 max-w-28">{conv.lastMessage}</p>}
//                       <p className="text-[10px] text-gray-400">
//                         {isToday
//                           ? lastMsgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                           : lastMsgDate.toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>

//                   {unread > 0 && (
//                     <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
//                       {unread}
//                     </span>
//                   )}
//                 </button>
//               )
//             })}

//           </div>
//         </aside>

//         {history.length > 0 && (<main className="flex-1 flex flex-col">
//           {/* Header */}
//           <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-5 py-3 backdrop-blur">
//             <IoIosArrowBack className={`text-2xl ${fullView ? 'rotate-0' : 'rotate-180'} transition-all duration-300 cursor-pointer`} onClick={() => setFullView(!fullView)} />
//             {chatUser && (
//               <>
//                 <img src={chatUser.image} className="h-10 w-10 rounded-full object-cover" />
//                 <div>
//                   <p className="font-semibold">{chatUser.username}</p>
//                   <p className="text-xs text-gray-500">{chatUser.online ? "Active now" : "Offline"}</p>
//                 </div>
//               </>
//             )}

//             <Link href={`/components/location/${chatUser?._id}`} className="cursor-pointer self-end ml-auto ">
//               <FaSearchLocation className="text-gray-600 text-4xl hover:text-indigo-500" />
//             </Link>
//           </div>

//           {/* Messages */}
//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
//             {messages.map(msg => {
//               const isSender = msg.senderId === user._id;
//               return (
//                 <div key={msg._id} className={`mb-2 flex ${isSender ? "justify-end" : "justify-start"}`}>
//                   <div className="flex flex-col items-end">
//                     <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${isSender ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
//                       {msg.text && <p className="break-words">{msg.text}</p>}
//                       {msg.image && <img src={msg.image} alt="sent" className="mt-2 max-w-xs rounded-lg" />}
//                       <div className="mt-1 text-[10px] select-none flex justify-between items-center">
//                         <span>{moment(msg.createdAt).format("h:mm A")}</span>
//                       </div>
//                     </div>
//                     {isSender && (
//                       <span className="ml-2 text-[10px] font-semibold">
//                         {msg.seen ? "Read" : "Unread"}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Composer */}
//           <div className="border-t border-gray-200 bg-white/80 p-3">
//             <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-2 ring-1 ring-gray-200 relative">

//               {/* Image Preview */}
//               {file && (
//                 <div className="relative w-32 h-32">
//                   <img
//                     src={URL.createObjectURL(file)}
//                     alt="preview"
//                     className="w-full h-full object-cover rounded-lg"
//                   />
//                   <button
//                     onClick={() => setFile(null)}
//                     className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
//                   >
//                     <ImCross className="text-sm" />
//                   </button>
//                 </div>
//               )}

//               <div className="flex items-end gap-2">
//                 <textarea
//                   rows={1}
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   placeholder="Aa"
//                   className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
//                 />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={e => setFile(e.target.files[0])}
//                   className="hidden"
//                   id="fileInput"
//                 />
//                 <label htmlFor="fileInput" className="cursor-pointer self-center flex items-center justify-center">
//                   <FaImage className="text-gray-600 text-3xl hover:text-indigo-500" />
//                 </label>
//                 <button
//                   onClick={handleSendMessage}
//                   className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white ${input || file ? 'bg-indigo-700' : 'bg-indigo-500 pointer-events-none'}`}
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>

//         </main>)}

//       </div>
//     </div>
//   );
// }

export default function page(params) {
  return (
    <div><Chat /></div>
  )
}
