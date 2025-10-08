import connectToDatabase from "../../../lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const { sender, receiver } = req.query;

      if (!sender || !receiver) {
        return res.status(400).json({ error: "Missing sender or receiver contact" });
      }

      const users = await User.find({
        contact: { $in: [sender, receiver] }
      }).lean();

      const profileMap = {};
      users.forEach(user => {
        profileMap[user.contact] = {
          name: user.name,
          photo: user.photo
        };
      });

      res.status(200).json({
        sender: profileMap[sender] || { name: `User ${sender}`, photo: "/icons/profile.png" },
        receiver: profileMap[receiver] || { name: `User ${receiver}`, photo: "/icons/profile.png" }
      });
    } catch (err) {
      console.error("GET /api/chat/profile error:", err);
      res.status(500).json({ error: err.message });
    }
  }
}
