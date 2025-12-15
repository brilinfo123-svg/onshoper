// pages/api/sendNotification/send-notification.js
import { admin } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { token, title, body } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing FCM token" });
    }

    const message = {
      token,
      notification: {
        title: title || "New Notification",
        body: body || "You have a new message",
      },
      webpush: {
        notification: {
          icon: "/icon.png",
          click_action: "https://onshoper.com",
        },
        fcmOptions: {
          link: "https://onshoper.com",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);

    res.status(200).json({ success: true, messageId: response });
  } catch (err) {
    console.error("❌ FCM send error:", err.code, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
