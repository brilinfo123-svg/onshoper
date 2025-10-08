import { useState } from "react";
import styles from "@/components/Subscribe/Index.module.scss";

const SubscribeButton: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false); // Subscription state
  const [status, setStatus] = useState<string>(""); // Status message

  const handleSubscription = async () => {
    try {
      const response = await fetch(`/api/${isSubscribed ? "unsubscribe" : "subscribe"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscribed: !isSubscribed }),
      });

      if (response.ok) {
        setIsSubscribed(!isSubscribed);
        const newStatus = isSubscribed ? "Unsubscribed successfully!" : "Subscribed successfully!";
        setStatus(newStatus);
        
        // Hide status after 2 seconds
        setTimeout(() => {
          setStatus("");
        }, 2000);
      } else {
        const error = await response.json();
        setStatus(error.message || "An error occurred. Please try again.");
        
        // Hide status after 2 seconds
        setTimeout(() => {
          setStatus("");
        }, 2000);
      }
    } catch (error) {
      setStatus("An error occurred. Please try again later.");
      
      // Hide status after 2 seconds
      setTimeout(() => {
        setStatus("");
      }, 2000);
    }
  };

  return (
    <>
      <button className={`${styles.subscribeBtn} ${"icon-bell"}`}
        onClick={handleSubscription}
        style={{
          backgroundColor: isSubscribed ? "#FF4D4D" : "#007BFF", // Red for unsubscribe, blue for subscribe
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = isSubscribed ? "#CC0000" : "#0056b3")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = isSubscribed ? "#FF4D4D" : "#007BFF")
        }
      >
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </button>
      {status && <p style={{ marginTop: "10px", color: "green" }}>{status}</p>}
    </>
  );
};

export default SubscribeButton;
