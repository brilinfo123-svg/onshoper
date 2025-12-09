// pages/api/notifications/[userId].js
import db from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    // Count unread messages for this receiver
    const unreadCount = await db.collection("messages").countDocuments({
      receiver: userId,
      hiddenForReceiver: false, // only count if not hidden
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
