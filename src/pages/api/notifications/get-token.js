import NotificationToken from "@/models/NotificationToken"; // mongoose model

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }

  const tokenDoc = await NotificationToken.findOne({
    userId,
    device: "web",
  }).sort({ createdAt: -1 });

  if (!tokenDoc) {
    return res.json({ token: null });
  }

  res.json({ token: tokenDoc.token });
}
