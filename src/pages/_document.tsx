import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
