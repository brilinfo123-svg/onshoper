import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" /> 
        <meta name="theme-color" content="#0A84FF" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Google & Facebook Verification */}
        <meta name="google-site-verification" content="9o4H1zQMeYw4iWtD4JcfrFGwQ5ZiIOUuAMhR-eO9nuc" />
        <meta 
          name="facebook-domain-verification" 
          content="5rpwhxj3a87kpora90zzvsxj147g1l" 
        />

        {/* OneSignal SDK */}

        {/* <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script> */}

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
