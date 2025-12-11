import admin from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token, title, body } = req.body;

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: "/icon.png",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ FCM v1 message sent:", response);
    res.status(200).json({ success: true, messageId: response });
  } catch (err) {
    console.error("❌ FCM v1 error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
