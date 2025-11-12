import React, { useEffect, useState } from "react";
import styles from "@/styles/login.module.scss";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/"); // Redirect to home if already logged in
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      setModalMessage(result.error || "Login failed. Please try again.");
      setShowModal(true);
    } else {
      setModalMessage("Login successful!");
      setShowModal(true);
      setTimeout(() => {
        router.push("/category"); // Redirect to home after a brief delay
      }, 1000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className={styles.haveUnAcount}>
            <Link href="/auth/signin">Don't have an account?</Link>
          </div>
        </div>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>{modalMessage}</p>
            <button onClick={closeModal} className={styles.closeModalButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
