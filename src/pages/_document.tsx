import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <meta name="google-site-verification" content="6XOdt6iyzuee-IXJ6Axq600RFXyh-mKqGObQvYgr2qE" />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
