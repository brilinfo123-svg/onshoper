import { useSession } from "next-auth/react";
import FeatureButton from "@/components/FeaturedButton/Index";

export default function SubscribePage() {
  const { data: session } = useSession();

  console.log(session);

  return (
    <div>
      <h1>🛒 Upgrade to Featured</h1>
      {session?.user?.id ? (
        <FeatureButton shopOwnerID={session.user.id} />
      ) : (
        <p>Please login first.</p>
      )}
    </div>
  );
}
