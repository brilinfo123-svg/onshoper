import { Cursor } from "mongoose";
import Link from "next/link";
import React from "react";

const Button = ({ children, href, color = "black", text = "white", onClick, ...props }) => {
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

  if (href) {
    return (
      <Link href={href} className="custom-button" style={style} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="custom-button" style={style} {...props}>
      {children}
    </button>
  );
};


export default Button;
