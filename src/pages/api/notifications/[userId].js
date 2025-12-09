import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("test"); // apna DB name
    const unreadCount = await db.collection("messages").countDocuments({
      receiver: userId,
      hiddenForReceiver: false,
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
