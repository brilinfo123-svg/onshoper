import bcrypt from "bcrypt";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { password } = req.body;
    const hash = process.env.ADMIN_PASSWORD_HASH;

    // Debug Logs
    console.log("===== LOGIN DEBUG =====");
    console.log("Password from frontend:", password);
    console.log("Password length:", password?.length);
    console.log("Hash from .env:", hash);

    if (!hash) {
      console.log("❌ ADMIN_PASSWORD_HASH is missing!");
      return res.status(500).json({
        ok: false,
        error: "ADMIN_PASSWORD_HASH not found in .env",
      });
    }

    const passwordOk = await bcrypt.compare(password.trim(), hash);

    console.log("Password Match:", passwordOk);
    console.log("=======================");

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    // Set Cookie
    const cookie = serialize("authToken", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      ok: true,
      message: "Login Successful",
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      ok: false,
      error: "Internal Server Error",
    });
  }
}