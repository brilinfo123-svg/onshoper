// pages/api/messages/[userId].js
import { getSession } from "next-auth/react";
import connectToDatabase from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userId } = req.query;

  try {
    await connectToDatabase();
    
    const messages = await Message.find({
      $or: [
        { sender: session.user.id, receiver: userId },
        { sender: userId, receiver: session.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(100);

    res.status(200).json({ messages: JSON.parse(JSON.stringify(messages)) });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}