import NotificationToken from "@/models/NotificationToken"; // mongoose model

export default async function handler(req, res) {
  try {
    // ✅ Fetch latest token (device = "web" optional)
    const tokenDoc = await NotificationToken.findOne({ device: "web" })
      .sort({ createdAt: -1 });

    if (!tokenDoc) {
      return res.json({ token: null });
    }

    // ✅ Return only token field
    res.json({ token: tokenDoc.token });
  } catch (error) {
    console.error("❌ Error fetching token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
