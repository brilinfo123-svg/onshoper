import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function withProtectedPage<P>(Component: React.ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // Wait for session to load

      if (!session) {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    }, [session, status, router]);

    // Show loading state while session is being fetched
    if (status === "loading") {
      return <div>Loading...</div>;
    }

    // If authenticated, render the page
    if (session) {
      return <Component {...props} />;
    }

    return null; // Return nothing if not authenticated and redirected
  };
}
