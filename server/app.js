require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

connectDB();

 const allowedOrigins = [
    'http://localhost:3000', // For local development
    'http://localhost:5173', // For local Vite development
    'https://coldstart-frontend.netlify.app/', // Your Netlify URL
    'https://coldstart-frontend-shna.onrender.com', // Your Render frontend URL
    'https://coldstart-backend-o4zb.onrender.com' // Your Render backend URL (if making self-requests)
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
// }));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
// Line 45 should now be empty or contain a valid route above

/* =========================
   SOCKET.IO SETUP
========================= */
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
  transports: ["websocket"],
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("addUser", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId, content, createdAt: new Date().toISOString(),
      });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.get("/", (req, res) => res.send("🚀 Realtime Backend Running Successfully"));

server.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));

module.exports = { io, onlineUsers };