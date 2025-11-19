import bcrypt from "bcrypt";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { password } = req.body;
  const hash = process.env.ADMIN_PASSWORD_HASH;

  const passwordOk = await bcrypt.compare(password, hash);

  if (!passwordOk) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  // ✅ set secure cookie
  const cookie = serialize("authToken", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
