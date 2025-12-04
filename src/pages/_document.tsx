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
        <script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
        ></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "e9e306bb-c8ab-4d1a-9723-5749d4300f2f", // ✅ Your Live App ID
                  notifyButton: { enable: true },
                  serviceWorkerPath: '/OneSignalSDKWorker.js',
                  serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
                  allowLocalhostAsSecureOrigin: true // ✅ Optional for localhost testing
                });
              });
            `,
          }}
        />

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
