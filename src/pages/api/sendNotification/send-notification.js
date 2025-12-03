export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { receiverId, senderName, message } = req.body;
  
    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`, // 👈 tumhara REST API Key
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID, // 👈 tumhara OneSignal App ID
          include_external_user_ids: [receiverId], // 👈 login ke time set kiya externalUserId
          headings: { en: `${senderName} sent you a message` },
          contents: { en: message },
          url: `https://onshoper.com/chat/${senderName}`, // 👈 click pe chat open ho
        }),
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Notification error:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  }
  