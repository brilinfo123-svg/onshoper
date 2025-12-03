import axios from "axios";

export default async function handler(req, res) {
  try {
    const { phone, messagePreview, senderName } = req.body;

    if (!phone) return res.status(400).json({ error: "Phone number required" });

    const result = await axios.post(
      "https://backend.aisensy.com/campaign/t1/api/v2", // AISENSY ENDPOINT
      {
        apiKey: process.env.AISENSY_API_KEY,
        campaignName: "Message Notification",
        destination: phone,
        userName: senderName || "Someone",
        templateParams: [messagePreview], 
      }
    );

    return res.status(200).json({ success: true, result: result.data });
  } catch (error) {
    console.error("Aisensy error:", error?.response?.data);
    res.status(500).json({ error: "Notification error" });
  }
}
