import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        {/* Verification */}
        <meta 
          name="google-site-verification" 
          content="6XOdt6iyzuee-IXJ6Axq600RFXyh-mKqGObQvYgr2qE" 
        />
        <meta 
          name="facebook-domain-verification" 
          content="5rpwhxj3a87kpora90zzvsxj147g1l" 
        />

        {/* Responsive Meta */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1" 
        />

        {/* OneSignal Push Notification Setup */}
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
                  appId: "1b2aa8e0-16d9-46b8-8393-aee12c888950",
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
