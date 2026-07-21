import { useState, useRef, useEffect } from "react";
import Link from "../../../node_modules/next/link";
import styles from "./Index.module.scss";

interface ShareDropdownProps {
  title: string;
}

export default function ShareDropdown({ title }: ShareDropdownProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const productUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const shareText = `${title} - ${productUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.shareContainer} ref={dropdownRef}>
      <button
        aria-label="Share"
        className={`${styles.shareBtn} icon-share`}
        onClick={() => setOpen(!open)}
      ></button>

      {open && (
        <ul className={styles.dropdown}>
          <li className={styles.whatsapp}>
            <Link
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              className="icon-whatsapp"
            >
              WhatsApp
            </Link>
          </li>

          <li className={styles.facebook}>
            <Link
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                productUrl
              )}`}
              target="_blank"
              className="icon-facebook"
            >
              Facebook
            </Link>
          </li>

          <li className={styles.twitter}>
            <Link
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                productUrl
              )}&text=${encodeURIComponent(title)}`}
              target="_blank"
              className="icon-twitter"
            >
              Twitter
            </Link>
          </li>

          <li className={styles.instagram}>
            <Link
              href="https://www.instagram.com/"
              target="_blank"
              className="icon-instagram"
            >
              Instagram
            </Link>
          </li>

          <li className={styles.messenger}>
            <Link
              href={`https://www.messenger.com/t/?link=${encodeURIComponent(
                productUrl
              )}`}
              target="_blank"
              className="icon-comment"
            >
              Messenger
            </Link>
          </li>

          <li className={styles.copy}>
            <button aria-label="Copy" onClick={copyLink} className="icon-docs">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
