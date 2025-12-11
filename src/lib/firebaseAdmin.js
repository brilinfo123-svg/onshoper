import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json"; // 👈 adjust path

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
