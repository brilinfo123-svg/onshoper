export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
  
    const { token } = req.body;
  
    try {
      const response = await fetch("https://verify.msg91.com/api/v1/token/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY, // ✅ Uses your secret token
        },
        body: JSON.stringify({ token }),
      });
  
      const data = await response.json();
  
      if (data.status === "verified") {
        const contact = data.mobile || data.email;
        const user = { contact }; // Replace with DB lookup if needed
        return res.status(200).json({ user });
      } else {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
  