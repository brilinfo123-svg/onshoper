import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      Swal.fire({ icon: "success", title: "Thank You!", text: "Your app installation has started.", confirmButtonColor: "#3b82f6", });
    } else {
      Swal.fire({
        icon: "info",
        title: "Installation Cancelled",
        text: "You dismissed the install prompt.",
        confirmButtonColor: "#3b82f6",
      });
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {showButton && (
        <button
          onClick={installApp}
          style={{
            padding: "12px 20px",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "20px",
            width: "100%",
          }}
        >
          Install Now
        </button>
      )}
    </>
  );
}
