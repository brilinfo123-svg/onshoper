import { serialize } from "cookie";

export default function handler(req, res) {
  // expire the cookie immediately
  const cookie = serialize("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // expire now
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
