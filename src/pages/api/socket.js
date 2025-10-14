import { io } from "socket.io-client";

const socket = io("https://socket-server-gf0a.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});
