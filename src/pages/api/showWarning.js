export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "❌ Email is required" });
    }
  
    res.status(200).json({ message: "⚠️ Your package will expire in 5 seconds!" });
  }
  