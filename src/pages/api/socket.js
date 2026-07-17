import { Server } from "socket.io";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  // Initialize Socket.IO only once
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    // ---------------------------------------------------------
    // 🔌 CONNECTION
    // ---------------------------------------------------------
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // ---------------------------------------------------------
      // 👤 JOIN USER ROOM
      // ---------------------------------------------------------
      socket.on("join", async (userId) => {
        try {
          console.log("JOIN REQUEST:", userId);

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

      // ---------------------------------------------------------
      // 💬 SEND REAL-TIME MESSAGE
      // ---------------------------------------------------------
      socket.on("sendMessage", (data) => {
        io.to(String(data.receiverId)).emit("receiveMessage", data);
        io.to(String(data.senderId)).emit("receiveMessage", data);
      });

      // ---------------------------------------------------------
      // ❌ USER DISCONNECT
      // ---------------------------------------------------------
      socket.on("disconnect", async (reason) => {
        try {
          console.log("SOCKET DISCONNECTED:", socket.id, reason);

          const userId = socket.userId;

          console.log("DISCONNECT USER:", userId);

          if (!userId) {
            console.log("USER ID NOT FOUND");
            return;
          }

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
