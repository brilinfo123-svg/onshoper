"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import styles from "./AdminLogin.module.scss";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  // ⏱ On mount, check cooldown in localStorage
  useEffect(() => {
    const cooldownEnd = localStorage.getItem("cooldownEnd");
    if (cooldownEnd) {
      const remaining = Math.floor((+cooldownEnd - Date.now()) / 1000);
      if (remaining > 0) {
        setIsDisabled(true);
        setTimer(remaining);
      } else {
        localStorage.removeItem("cooldownEnd");
      }
    }
  }, []);

  // ⏱ Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsDisabled(false);
            setAttempts(0);
            localStorage.removeItem("cooldownEnd");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDisabled, timer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚫 Blank input validation
    if (!password.trim()) {
      Swal.fire({
        title: "Input Required",
        text: "Password cannot be blank.",
        icon: "warning",
        confirmButtonColor: "#ff6d01",
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        Swal.fire({
          title: "Login Successful 🎉",
          text: "Welcome Admin!",
          icon: "success",
          confirmButtonColor: "#ff6d01",
        }).then(() => {
          router.push("/admin");
        });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts < 4) {
          Swal.fire({
            title: "Access Denied",
            text: "You entered wrong password.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } else {
          setIsDisabled(true);
          setTimer(120); // 2 minutes
          localStorage.setItem("cooldownEnd", (Date.now() + 120000).toString());

          Swal.fire({
            title: "Too Many Attempts",
            text: "Login disabled for 2 minutes.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      }
    } catch (err) {
      Swal.fire({
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h2 className={styles.title}>🔒 Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={isDisabled}
        />
        <button type="submit" className={styles.button} disabled={isDisabled}>
          {isDisabled ? `Try again in ${timer}s` : "Login"}
        </button>
      </form>
    </div>
  );
}
