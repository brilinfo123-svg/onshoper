import clientPromise from "@/lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

// 👇 Helper function to normalize contact
function normalizeContact(contact) {
  if (!contact) return contact;
  if (contact.startsWith("+91")) return contact.slice(3);   // remove +91
  if (contact.startsWith("91") && contact.length > 10) return contact.slice(2); // remove 91 prefix if >10 digits
  return contact;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { userId, contact, token, device } = req.body;

    if (!userId || !contact || !token) {
      return res.status(400).json({ error: "Missing userId, contact or token" });
    }

    // ✅ Normalize contact before saving
    const normalizedContact = normalizeContact(contact);

    await NotificationToken.updateOne(
      { userId, contact: normalizedContact, device: device || "web" },   // condition
      {
        userId,
        contact: normalizedContact,
        token,
        device: device || "web",
        createdAt: new Date(),
      }, // update
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving token:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
