import { getSession } from "next-auth/react";
import dbConnect from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await dbConnect();

    const { receiverId, message, productTitle } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newMessage = new Message({
      sender: session.user.id,
      receiver: receiverId,
      message: message.trim(),
      productTitle: productTitle || "Product"
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      sentMessage: savedMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}