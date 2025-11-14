import { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2"; // ✅ import SweetAlert2
import styles from "./AdminLogin.module.scss";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "true");

      // ✅ Success popup
      Swal.fire({
        title: "Login Successful 🎉",
        text: "Welcome Admin!",
        icon: "success",
        confirmButtonColor: "#ff6d01",
      }).then(() => {
        router.push("/admin"); // redirect after popup
      });
    } else {
      // ❌ Error popup
      Swal.fire({
        title: "Access Denied",
        text: "Invalid password. Please try again.",
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
        />
        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}
