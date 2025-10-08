import connectToDatabase from "../../../lib/mongodb";
import Message from "../../../models/Message";

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

    // Step 1: Soft delete — mark messages hidden for current user
    await Message.updateMany(
      { sender: currentUserId, receiver: otherUserId },
      { $set: { hiddenForSender: true } }
    );

    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId },
      { $set: { hiddenForReceiver: true } }
    );

    // Step 2: Hard delete — remove messages where both users have hidden them
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      hiddenForSender: true,
      hiddenForReceiver: true
    });

    res.status(200).json({
      success: true,
      message: 'Chat hidden for current user. Fully deleted where both users have hidden.'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
