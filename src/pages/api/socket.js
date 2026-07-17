import { Server } from "socket.io";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: [
          "http://localhost:3000",              // local dev
          "https://onshoper.com",   // production frontend domain
        ],
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // JOIN ROOM
      socket.on("join", async (userId) => {
        try {
          socket.userId = String(userId);
          socket.join(String(userId));

          await dbConnect();
          await User.findByIdAndUpdate(userId, {
            isOnline: true,
            emailNotificationSent: false,
          });

          io.emit("userOnline", { userId });
          console.log("Online:", userId);
        } catch (error) {
          console.log("JOIN ERROR:", error);
        }
      });

      // SEND MESSAGE
      socket.on("sendMessage", (data) => {
        io.to(String(data.receiverId)).emit("receiveMessage", data);
        io.to(String(data.senderId)).emit("receiveMessage", data);
      });

      // DISCONNECT
      socket.on("disconnect", async (reason) => {
        try {
          console.log("SOCKET DISCONNECTED:", socket.id, reason);
          const userId = socket.userId;

          if (!userId) return;

          await dbConnect();
          const lastSeen = new Date();

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
            emailNotificationSent: false,
          });

          io.emit("userOffline", { userId, lastSeen });
          console.log("Offline:", userId);
        } catch (error) {
          console.log("DISCONNECT ERROR:", error);
        }
      });
    });
  }

  res.end();
}
