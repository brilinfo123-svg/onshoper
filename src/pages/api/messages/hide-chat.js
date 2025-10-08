// pages/api/messages/hide-chat.js

import connectToDatabase from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { currentUserId, otherUserId } = req.body;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Mark messages as hidden for the current user (soft delete)
    // For messages where current user is sender
    await Message.updateMany(
      {
        sender: currentUserId,
        receiver: otherUserId
      },
      {
        $set: { hiddenForSender: true }
      }
    );

    // For messages where current user is receiver
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId
      },
      {
        $set: { hiddenForReceiver: true }
      }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Chat hidden successfully'
    });
  } catch (error) {
    console.error('Error hiding chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}