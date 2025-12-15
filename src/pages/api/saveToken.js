import clientPromise from "@/lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { userId, contact, token, device } = req.body;

    if (!userId || !contact || !token) {
      return res.status(400).json({ error: "Missing userId, contact or token" });
    }

    await NotificationToken.updateOne(
      { userId, contact, device: device || "web" },   // condition
      { userId, contact, token, device: device || "web", createdAt: new Date() }, // update
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving token:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
