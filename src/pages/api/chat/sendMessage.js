import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export default async function handler(req, res) {
  console.time("SEND_MESSAGE_TOTAL");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    console.timeLog("SEND_MESSAGE_TOTAL", "MongoDB connected");

    const { chatId, senderId, receiverId, message } = req.body;

    console.log("MESSAGE DATA", { chatId, senderId, receiverId, message });

    const newMessage = await Message.create({
      chatId,
      senderId,
      receiverId,
      message,
      isSeen: false,
    });

    console.timeLog("SEND_MESSAGE_TOTAL", "Message created");

    const chat = await Chat.findById(chatId);
    console.timeLog("SEND_MESSAGE_TOTAL", "Chat fetched");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const update = {
      lastMessage: message,
      lastMessageSender: senderId,
      lastMessageSeen: false,
    };

    if (chat.buyer.toString() === senderId) {
      update.buyerUnreadCount = 0;
      update.sellerDeleted = false;
      update.$inc = { sellerUnreadCount: 1 };
    } else {
      update.sellerUnreadCount = 0;
      update.buyerDeleted = false;
      update.$inc = { buyerUnreadCount: 1 };
    }

    await Chat.findByIdAndUpdate(chatId, update);
    console.timeLog("SEND_MESSAGE_TOTAL", "Chat updated");

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    console.timeLog("SEND_MESSAGE_TOTAL", "Users fetched");

    if (receiver && receiver.contact) {
      const THIRTY_MINUTES = 30 * 60 * 1000;
      const now = Date.now();

      const lastEmailTime = receiver.lastEmailSentAt
        ? new Date(receiver.lastEmailSentAt).getTime()
        : 0;

      const shouldSendEmail =
        !receiver.isOnline &&
        (lastEmailTime === 0 || now - lastEmailTime >= THIRTY_MINUTES);

      console.log("📧 SHOULD SEND EMAIL:", shouldSendEmail);

      if (shouldSendEmail) {
        console.timeLog("SEND_MESSAGE_TOTAL", "Email started");

        const chatWithProduct = await Chat.findById(chatId).populate(
          "product",
          "title coverImage"
        );

        await sendEmail({
          to: receiver.contact,
          subject: "New message on OnShoper",
          message: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Message</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:30px;">OnShoper</h1>
              <p style="margin-top:10px;color:#cbd5e1;font-size:15px;">Buy • Sell • Rent</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:35px;">
              <h2 style="margin-top:0;color:#111827;font-size:24px;">📩 You have a new message</h2>
              <p style="font-size:16px;color:#4b5563;line-height:1.7;">
                Hi <strong>${receiver.name || "User"}</strong>,
              </p>
              <p style="font-size:16px;color:#4b5563;line-height:1.7;">
                <strong>${sender?.name || "Someone"}</strong> has sent you a new message regarding your listing on <strong>OnShoper</strong>.
              </p>
              ${
                chatWithProduct?.product
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td width="120" style="padding:15px;">
                    <img src="${chatWithProduct.product.coverImage}" style="width:100px;height:100px;border-radius:8px;object-fit:cover;">
                  </td>
                  <td style="padding:15px;">
                    <h3 style="margin:0;color:#111827;font-size:20px;">${chatWithProduct.product.title}</h3>
                    <p style="margin-top:12px;color:#6b7280;">A customer has contacted you about this product.</p>
                  </td>
                </tr>
              </table>`
                  : ""
              }
              <div style="margin-top:20px;padding:18px;background:#eff6ff;border-left:5px solid #2563eb;border-radius:8px;">
                <p style="margin:0;color:#111827;font-size:16px;">"${message}"</p>
              </div>
              <div style="text-align:center;margin-top:35px;">
                <a href="https://onshoper.com/chat?chatId=${chatId}" style="display:inline-block;padding:15px 35px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;border-radius:8px;">Reply Now</a>
              </div>
              <p style="margin-top:35px;color:#6b7280;font-size:14px;line-height:1.8;">
                You're receiving this email because someone sent you a message on OnShoper. If you've already viewed the message, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:25px;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;">© ${new Date().getFullYear()} OnShoper. All Rights Reserved.</p>
              <p style="margin-top:8px;font-size:14px;">
                <a href="https://onshoper.com" style="color:#2563eb;text-decoration:none;">Visit OnShoper</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        });

        console.timeLog("SEND_MESSAGE_TOTAL", "Email completed");

        await User.findByIdAndUpdate(receiverId, {
          lastEmailSentAt: new Date(),
        });
      } else {
        console.log("❌ EMAIL NOT SENT");
      }
    }

    console.timeEnd("SEND_MESSAGE_TOTAL");

    return res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
