import Link from "next/link";
import React from "react";

const Button = ({
  children,
  href,
  color = "black",
  text = "white",
  onClick,
  ariaLabel,
  title,
  ...props
}) => {
  const style = {
    backgroundColor: color,
    color: text,
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block",
    fontWeight: "bold",
    cursor: "pointer",
  };

  // Generate label from children if not provided
  const label =
    ariaLabel ||
    (typeof children === "string" ? children : "Button");

  if (href) {
    return (
      <Link
        href={href}
        className="custom-button"
        style={style}
        aria-label={label}
        title={title || label}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="custom-button"
      style={style}
      aria-label={label}
      title={title || label}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;