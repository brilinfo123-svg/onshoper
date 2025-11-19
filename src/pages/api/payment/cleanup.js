// /pages/api/cleanup.js
import { cleanupExpiredCategories } from "@/utils/cleanupExpiredCategories";

export default async function handler(req, res) {
  await cleanupExpiredCategories();
  res.status(200).json({ success: true, message: "Expired categories cleaned up" });
}
