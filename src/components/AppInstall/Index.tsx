import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      Swal.fire({
        icon: "info",
        title: "Please refresh the page",
        // text: " to try again.",
        confirmButtonText: "Refresh Page", // 👈 button text
        confirmButtonColor: "#3b82f6",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload(); // 🔄 reload
        }
      });
      return;
    }
  
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
  
    if (result.outcome === "accepted") {
      Swal.fire("Success", "App installation started", "success");
    }
  
    setDeferredPrompt(null);
  };

  return (
    <>
      {isInstalled && (
        <p style={{ color: "#16a34a", textAlign: "center" }}>
          ✔ You already installed this app
        </p>
      )}

      {!isInstalled && (
        <button
          onClick={installApp}
          style={{
            padding: "12px 20px",
            background: deferredPrompt ? "#3b82f6" : "#3cb231",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "20px",
            width: "100%",
          }}
        >
          {deferredPrompt ? "Install Now" : "Get App"}
        </button>
      )}
    </>
  );
}