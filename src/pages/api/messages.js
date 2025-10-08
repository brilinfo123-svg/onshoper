import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const {
        sender,
        senderName,
        receiver,
        message,
        productId,
        productTitle,
        coverImage,
        otherUserName
      } = req.body;

      // Validate required fields
      if (!sender || !receiver || !message) {
        return res.status(400).json({
          error: "Missing required fields: sender, receiver, message"
        });
      }

      const newMessage = new Message({
        sender,
        senderName: senderName || null,     
        receiver,
        message,
        productId: productId || null,
        productTitle: productTitle || null,
        coverImage: coverImage || null,           // ✅ Added
        otherUserName: otherUserName || null      // ✅ Added
      });
      
      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (err) {
      console.error("POST /api/messages error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const { userId, otherUserId } = req.query;

      if (!userId || !otherUserId) {
        return res.status(400).json({
          error: "Missing required query parameters: userId, otherUserId"
        });
      }

      const messages = await Message.find({
        $or: [
          {
            sender: userId,
            receiver: otherUserId,
            hiddenForSender: { $ne: true }
          },
          {
            sender: otherUserId,
            receiver: userId,
            hiddenForReceiver: { $ne: true }
          }
        ]
      }).sort({ createdAt: 1 });

      res.status(200).json(messages);
    } catch (err) {
      console.error("GET /api/messages error:", err);
      res.status(500).json({ error: err.message });
    }
  }
}
