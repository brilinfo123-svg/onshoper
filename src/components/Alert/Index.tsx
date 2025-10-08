import styles from "./index.module.scss";
import { useEffect, useState } from "react";

const Alert = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`${styles.alertBox} ${!visible ? styles.hide : ""}`}>
      <strong>✅ Success:</strong> <span>{message}</span>
    </div>
  );
};

export default Alert;
