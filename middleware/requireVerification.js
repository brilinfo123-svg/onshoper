export default function requireVerification(user) {
    if (!user.emailVerified || user.status !== "Approved" || !user.selfieVerified) {
      throw new Error("Verification required before posting rental products.");
    }
  }
  