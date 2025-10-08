import connectToDatabase from "../../../lib/mongodb";
import Message from "../../../models/Message";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { otherUserId } = req.query;
    
    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    const session = await getSession({ req });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if chat already exists
    const existingChat = await Message.findOne({
      $or: [
        { sender: session.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: session.user.id }
      ]
    }).sort({ createdAt: -1 }); // Latest message first

    res.status(200).json({ 
      chatExists: !!existingChat,
      lastMessage: existingChat ? {
        message: existingChat.message,
        createdAt: existingChat.createdAt
      } : null
    });
  } catch (error) {
    console.error('Error checking chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}