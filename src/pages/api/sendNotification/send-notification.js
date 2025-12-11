// pages/api/sendNotification/send-notification.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { receiverId, senderName, message, senderId } = req.body;

  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [savedMessage.receiver], // 👈 directly use receiver field
        headings: { en: `${savedMessage.senderName} sent you a message` },
        contents: { en: savedMessage.message },
        url: `https://onshoper.com/chat/${savedMessage.sender}`, // 👈 open chat with sender
        data: {
          productId: savedMessage.productId,
          productTitle: savedMessage.productTitle,
          coverImage: savedMessage.coverImage
        }
      }),
    });
    

    const data = await response.json();

    if (!response.ok) {
      console.error("OneSignal error:", data);
      return res.status(response.status).json({ message: "Failed to send notification", error: data });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ message: "Failed to send notification", error: error.message });
  }
}
