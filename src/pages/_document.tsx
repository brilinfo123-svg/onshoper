import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        {/* Google & Facebook Verification */}
        <meta 
          name="google-site-verification" 
          content="6XOdt6iyzuee-IXJ6Axq600RFXyh-mKqGObQvYgr2qE" 
        />
        <meta 
          name="facebook-domain-verification" 
          content="5rpwhxj3a87kpora90zzvsxj147g1l" 
        />

        {/* OneSignal SDK */}

        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
