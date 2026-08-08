import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function withProtectedPage<P>(Component: React.ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Show loading state while session is being fetched
    if (status === "loading") {
      return <div>Loading...</div>;
    }

    // If not authenticated, redirect immediately
    if (!session) {
      if (typeof window !== "undefined") {
        router.replace("/login"); // replace avoids back button returning
      }
      return null; // block rendering
    }

    // If authenticated, render the page
    return <Component {...props} />;
  };
}
