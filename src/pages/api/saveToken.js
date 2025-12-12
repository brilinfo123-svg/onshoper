import clientPromise from "@/lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ error: "Missing userId or token" });
    }

    // ✅ Save or update token
    await NotificationToken.updateOne(
      { userId, token },
      { userId, token, device: "web" },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving token:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
