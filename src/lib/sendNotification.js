// // lib/sendNotification.js
// import NotificationToken from "@/models/NotificationToken";
// import admin from "firebase-admin";

// const sendNotification = async (receiverId, title, body) => {
//   try {
//     const tokenDoc = await NotificationToken.findOne({ userId: receiverId });
//     if (!tokenDoc) {
//       console.log("❌ No token found for receiver");
//       return;
//     }

//     const message = {
//       token: tokenDoc.token,
//       notification: {
//         title,
//         body,
//       },
//     };

//     // const response = await admin.messaging().send(message);
//     console.log("✅ Notification sent:", response);
//   } catch (error) {
//     console.error("❌ Error sending notification:", error);
//   }
// };

// export default sendNotification;
