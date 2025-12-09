import connectToDatabase from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    await connectToDatabase(); // ✅ ensure mongoose is connected

    // Count unread messages for this receiver (isRead = false)
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,          // ✅ use isRead field instead of hiddenForReceiver
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
