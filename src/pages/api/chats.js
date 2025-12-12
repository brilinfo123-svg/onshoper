// pages/api/chats.js
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat"; // 👈 Mongoose model for chats

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect(); // 👈 connect mongoose

    const chats = await Chat.aggregate([
      {
        $lookup: {
          from: "notificationtokens",        // join with tokens collection
          localField: "otherUserId",         // field in chats
          foreignField: "userId",            // field in notificationtokens
          as: "tokens"
        }
      },
      { $unwind: { path: "$tokens", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          otherUserId: 1,
          otherUserName: 1,
          fcmToken: "$tokens.token"          // expose token
        }
      }
    ]);

    res.status(200).json(chats);
  } catch (err) {
    console.error("❌ Error fetching chats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
