// pages/api/chats/sidebar.js
import { getSession } from "next-auth/react";
import connectToDatabase from "../../../lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";               // 👈 Correct import
import NotificationToken from "@/models/NotificationToken"; // 👈 For FCM token

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();

    // Current user ki saari chats (non-hidden)
    const messages = await Message.find({
      $or: [
        { sender: session.user.id, hiddenForSender: { $ne: true } },
        { receiver: session.user.id, hiddenForReceiver: { $ne: true } }
      ]
    }).sort({ createdAt: -1 });

    const chatMap = {};

    for (const msg of messages) {
      const otherUserId = msg.sender === session.user.id ? msg.receiver : msg.sender;

      if (!chatMap[otherUserId]) {
        chatMap[otherUserId] = {
          otherUserId,
          messages: []
        };

        // Fetch user info
        try {
          const user = await User.findById(otherUserId).select("name");
          chatMap[otherUserId].otherUser = user;
        } catch (error) {
          console.error(`Error fetching user ${otherUserId}:`, error);
          chatMap[otherUserId].otherUser = null;
        }

        // Fetch FCM token
        try {
          const tokenDoc = await NotificationToken.findOne({ userId: otherUserId });
          chatMap[otherUserId].fcmToken = tokenDoc ? tokenDoc.token : null;
        } catch (error) {
          console.error(`Error fetching token for ${otherUserId}:`, error);
          chatMap[otherUserId].fcmToken = null;
        }
      }

      chatMap[otherUserId].messages.push(msg);
    }

    // Final chat list
    const chats = Object.values(chatMap).map(chat => ({
      id: chat.otherUserId,
      otherUserId: chat.otherUserId,
      otherUser: chat.otherUser ? { name: chat.otherUser.name } : null,
      lastMessage: chat.messages[0]
        ? {
            message: chat.messages[0].message,
            productTitle: chat.messages[0].productTitle,
            createdAt: chat.messages[0].createdAt.toISOString()
          }
        : null,
      messageCount: chat.messages.length,
      fcmToken: chat.fcmToken || null
    }));

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
