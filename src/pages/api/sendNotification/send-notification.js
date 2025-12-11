export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token, title, body } = req.body;

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FCM_SERVER_KEY}`, // from Firebase console
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title,
          body,
          icon: "/icon.png",
        },
      }),
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FCM error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
