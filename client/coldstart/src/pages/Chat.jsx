import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedChat(location.state.selectedUser);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user || !token) return;
    axios.get("http://localhost:8080/api/connections/network", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConnections(res.data))
      .catch(console.error);
  }, [user, token]);

  useEffect(() => {
    if (!selectedChat || !token) return;
    axios.get(`http://localhost:8080/api/chat/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data.map((msg) => ({
            senderId: msg.sender,
            content: msg.content,
            createdAt: msg.createdAt,
          })));
      })
      .catch(console.error);
  }, [selectedChat, token]);

  /* ================= SOCKET (REAL-TIME FIX) ================= */
  useEffect(() => {
    // 1. Ensure user ID exists before attempting connection
    if (user && user.id) {
      console.log("✅ Socket: Emitting addUser for", user.id);
      socket.connect();
      socket.emit("addUser", user.id);
    } else {
      console.log("⏳ Socket: Waiting for user data...");
      return; 
    }

    socket.off("receiveMessage"); // Prevent duplicate listeners

    const onReceiveMessage = (data) => {
      console.log("📩 Message received via socket:", data);
      
      // 2. Functional update to avoid stale data closure
      setMessages((prev) => {
        // 3. Only show if it belongs to the current open window
        const isFromPartner = data.senderId === selectedChat?._id;
        const isFromMe = data.senderId === user.id;

        if (isFromPartner || isFromMe) {
          const exists = prev.some(m => m.createdAt === data.createdAt && m.content === data.content);
          return exists ? prev : [...prev, data];
        }
        return prev;
      });
    };

    socket.on("receiveMessage", onReceiveMessage);

    return () => {
      socket.off("receiveMessage");
    };
  }, [user?.id, selectedChat?._id]); // Re-bind listener on partner change

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const msgData = {
      senderId: user.id,
      receiverId: selectedChat._id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    // 1. Instant Real-time delivery via socket
    socket.emit("sendMessage", msgData);

    // 2. Optimistic UI update
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");

    // 3. Save to MongoDB database
    try {
      await axios.post("http://localhost:8080/api/chat", {
          receiverId: selectedChat._id,
          content: msgData.content,
        }, { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6 h-[85vh] p-6 mt-4">
        {/* Connection List */}
        <div className="col-span-3 glass-card p-6 overflow-y-auto custom-scrollbar">
          <h3 className="font-bold mb-6 text-lg border-b border-slate-800 pb-2">Messages</h3>
          <div className="space-y-2">
            {connections.map((c) => (
              <div key={c._id} onClick={() => setSelectedChat(c)}
                className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${selectedChat?._id === c._id ? "bg-indigo-600/20 border-indigo-500/50" : "hover:bg-slate-800/50"}`}>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold uppercase">{c.name.charAt(0)}</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm truncate">{c.name}</div>
                  <div className="text-[10px] text-indigo-400 font-medium truncate">{c.headline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-span-9 glass-card flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{selectedChat.name.charAt(0)}</div>
                <b className="text-sm">{selectedChat.name}</b>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-950/30 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} ref={scrollRef} className={`flex flex-col ${m.senderId === user.id ? "items-end" : "items-start"}`}>
                    <div className={`max-w-md px-4 py-2 rounded-2xl text-sm ${m.senderId === user.id ? "bg-indigo-600 rounded-br-none" : "bg-slate-800 rounded-bl-none border border-slate-700"}`}>
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/60 flex gap-3">
                <input className="flex-grow p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-600/20">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-500 opacity-40">
              <div className="text-6xl mb-4">✉️</div>
              <p>Select a peer to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;