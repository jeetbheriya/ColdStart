import { io } from "socket.io-client";

// Forced WebSocket configuration to match the backend exactly
const socket = io("http://localhost:8080", {
  withCredentials: true,
  transports: ["websocket"], 
  upgrade: false,
  autoConnect: false
});

export default socket;