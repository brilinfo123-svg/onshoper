import { getSession } from "next-auth/react";
import dbConnect from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await dbConnect();

    const { receiverId, message, productId, productTitle, coverImage, otherUserName } = req.body;

    if (!receiverId || !message.trim()) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Save Message
    const newMessage = new Message({
      sender: session.user.id || session.user.email,
      senderName: session.user.name || "Unknown",
      receiver: receiverId,
      message: message.trim(),
      productId: productId || null,
      productTitle: productTitle || "Product",
      coverImage: coverImage || null,
      otherUserName: otherUserName || null,
      hiddenForSender: false,
      hiddenForReceiver: false,
      isRead: false,
      createdAt: new Date(),
    });

    const savedMessage = await newMessage.save();

    // 🔥 Send Push Notification via OneSignal
    const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    const payload = {
      app_id: ONE_SIGNAL_APP_ID,
      include_external_user_ids: [receiverId],

      headings: { en: `${newMessage.senderName} sent you a message` },
      contents: { en: message },

      url: `https://onshoper.com/chat/${newMessage.sender}` // optional
    };

    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    res.status(201).json({
      success: true,
      sentMessage: savedMessage,
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}







// import { getSession } from "next-auth/react";
// import dbConnect from "../../../lib/mongodb";
// import Message from "@/models/Message";

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ success: false, message: 'Method not allowed' });
//   }

//   const session = await getSession({ req });
  
//   if (!session || !session.user) {
//     return res.status(401).json({ success: false, message: 'Unauthorized' });
//   }

//   try {
//     await dbConnect();

//     const { receiverId, message, productTitle } = req.body;

//     if (!receiverId || !message) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const newMessage = new Message({
//       sender: session.user.id,
//       receiver: receiverId,
//       message: message.trim(),
//       productTitle: productTitle || "Product"
//     });

//     const savedMessage = await newMessage.save();

//     res.status(201).json({
//       success: true,
//       sentMessage: savedMessage
//     });

//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// }