import connectToDatabase from "../../../lib/mongodb";
import Message from "../../../models/Message";

export default async function handler(req, res) {
  const { userId, otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: "Missing userId or otherUserId" });
  }

  try {
    await connectToDatabase();

    await Message.updateMany(
      { receiver: userId, sender: otherUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return res.status(500).json({ error: "Failed to mark messages as read" });
  }
}
