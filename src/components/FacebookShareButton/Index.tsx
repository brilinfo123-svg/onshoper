"use client"; // if you're on Next.js App Router

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function FacebookShareButton({ quote }: { quote?: string }) {
  const router = useRouter();
  const currentUrl = `https://onshoper.com${router.asPath}`; // dynamic current page URL

  return (
    <Link
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}&quote=${encodeURIComponent(quote || "")}`}
      target="_blank"
    >
      <Image
        src="/christmas/facebook.svg"
        width={40}
        height={40}
        alt="facebook"
        className="cursor-pointer"
      />
    </Link>
  );
}
