import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  const currentUserId = user?.id || user?._id; // 🔥 NORMALIZED USER ID

  const API_URL = import.meta.env.VITE_API_URL ;

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

  /* ================= CONNECTIONS ================= */
  useEffect(() => {
    if (!currentUserId || !token) return;

    axios
      .get(`${API_URL}/api/connections/network`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConnections(res.data))
      .catch(console.error);
  }, [currentUserId, token]);

  /* ================= LOAD CHAT ================= */
  useEffect(() => {
    if (!selectedChat || !token) return;

    axios
      .get(`${API_URL}/api/chat/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const normalized = res.data.map((msg) => ({
          senderId: msg.sender?._id || msg.sender, // 🔥 NORMALIZED
          content: msg.content,
          createdAt: msg.createdAt,
        }));
        setMessages(normalized);
      })
      .catch(console.error);
  }, [selectedChat, token]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!currentUserId) return;

    socket.connect();
    socket.emit("addUser", currentUserId);

    socket.off("receiveMessage");

    socket.on("receiveMessage", (data) => {
      const normalizedMsg = {
        senderId: data.senderId?.toString(),
        content: data.content,
        createdAt: data.createdAt,
      };

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.createdAt === normalizedMsg.createdAt &&
            m.content === normalizedMsg.content
        );
        return exists ? prev : [...prev, normalizedMsg];
      });
    });

    return () => socket.off("receiveMessage");
  }, [currentUserId, selectedChat?._id]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const msgData = {
      senderId: currentUserId.toString(),
      receiverId: selectedChat._id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", msgData);

    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");

    try {
      await axios.post(
        `${API_URL}/api/chat`,
        {
          receiverId: selectedChat._id,
          content: msgData.content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-linkedin-background text-linkedin-text-primary">
      <Navbar />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-[85vh] p-6 mt-4">

        {/* CONNECTION LIST */}
        <div className="col-span-full md:col-span-3 glass-card p-6 overflow-y-auto custom-scrollbar">
          <h3 className="font-bold mb-6 text-lg border-b border-linkedin-border pb-2">
            Messages
          </h3>

          <div className="space-y-2">
            {connections.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedChat(c)}
                className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${
                  selectedChat?._id === c._id
                    ? "bg-linkedin-blue/10 border-linkedin-blue/50"
                    : "hover:bg-linkedin-border"
                }`}
              >
                <div className="w-10 h-10 bg-linkedin-blue rounded-full flex items-center justify-center font-bold uppercase text-white">
                  {c.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm truncate">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-linkedin-blue font-medium truncate">
                    {c.headline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="col-span-full md:col-span-9 glass-card flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-linkedin-border bg-linkedin-card flex items-center gap-3">
                <div className="w-8 h-8 bg-linkedin-blue rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {selectedChat.name.charAt(0)}
                </div>
                <b className="text-sm">{selectedChat.name}</b>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-linkedin-background custom-scrollbar">
                {messages.map((m, i) => {
                  const isMe = m.senderId === currentUserId?.toString();

                  return (
                    <div
                      key={i}
                      ref={scrollRef}
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-linkedin-blue rounded-br-none text-white"
                            : "bg-linkedin-light-gray rounded-bl-none border border-linkedin-border"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] mt-1 text-linkedin-text-secondary">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-linkedin-border bg-linkedin-card flex gap-3"
              >
                <input
                  className="flex-grow p-3 bg-linkedin-background border border-linkedin-border rounded-xl outline-none focus:ring-1 focus:ring-linkedin-blue"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button className="bg-linkedin-blue text-white px-8 py-2 rounded-xl font-bold">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center opacity-40">
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
