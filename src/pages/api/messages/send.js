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

    if (!receiverId || !message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Save message in database
    const newMessage = new Message({
      sender: session.user.id || session.user.email || session.user.contact,
      senderName: session.user.name || session.user.email || "Unknown",
      receiver: receiverId,
      message: message.trim(),
      productId: productId || null,
      productTitle: productTitle || "Product",
      coverImage: coverImage || null,
      otherUserName: otherUserName || null,
      hiddenForSender: false,
      hiddenForReceiver: false,
      createdAt: new Date(),
    });

    const savedMessage = await newMessage.save();

    // Send OneSignal Push Notification
    const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID; // Add your OneSignal App ID in .env
    const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY; // Add REST API Key in .env

    const notificationBody = {
      app_id: ONE_SIGNAL_APP_ID,
      include_external_user_ids: [receiverId], // Make sure receiverId matches OneSignal External User ID
      headings: { en: `${newMessage.senderName} sent you a message` },
      contents: { en: message },
      url: `/chat/${newMessage.sender}`, // optional: link to chat page
    };

    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify(notificationBody),
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