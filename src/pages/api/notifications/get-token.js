// pages/api/notifications/get-token.js
import connectToDatabase from "../../../lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const { userId, contact } = req.query;

    if (!userId && !contact) {
      return res.status(400).json({ error: "Missing userId or contact" });
    }

    const query = userId ? { userId } : { contact };

    const tokenDoc = await NotificationToken.findOne(query).sort({ createdAt: -1 });

    if (!tokenDoc) {
      return res.status(404).json({ error: "Token not found" });
    }

    res.status(200).json({ token: tokenDoc.token });
  } catch (err) {
    console.error("❌ Error fetching token:", err);
    res.status(500).json({ error: err.message });
  }
}
