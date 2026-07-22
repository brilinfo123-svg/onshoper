import InstallButton from "@/components/AppInstall/Index";
import Link from "next/link";
import SEO from "next/head";

export default function InstallApp() {
  return (
    <>
    <SEO>
        <title>Install OnShoper App – Fast & Easy</title>
        <meta
          name="description"
          content="Install the OnShoper PWA app on your device. Get quick access to buy, sell, and rent products and services anytime, anywhere."
        />
        <link rel="canonical" href="https://onshoper.com/install" />
        <meta name="robots" content="index, follow" />

        {/* Social Sharing */}
        <meta property="og:title" content="Install OnShoper App – Fast & Easy" />
        <meta
          property="og:description"
          content="Add OnShoper to your home screen. Buy, sell, and rent products instantly with our progressive web app."
        />
        <meta property="og:image" content="/images/OnshoperApp.png" />
        <meta property="og:url" content="https://onshoper.com/install" />
      </SEO>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #f7f9fc, #eef4ff);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .pageWrapper {
          text-align: center;
          padding: 10px;
          animation: fadeIn 0.8s ease-out;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title {
          font-size: 30px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 14px;
          color: #475569;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .qrCard {
          display: inline-block;
          border-radius: 55px;
          box-shadow: 0 -30px 50px rgba(0, 0, 0, 0.08);
          animation: float 3s infinite ease-in-out;
        }

        .qrImage {
          width: 220px;
          height: 220px;
          border-radius: 12px;
        }

        .linkText {
          margin-top: 20px;
          font-size: 15px;
          color: #334155;
        }

        .linkText strong {
          color: #0f172a;
        }

        /* Back button */
        .backButton {
          margin-top: 25px;
          display: inline-block;
          background: #3b82f6;
          color: #fff;
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .backButton:hover {
          background: #2563eb;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.35);
        }
.installContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.leftImages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 1s ease-out;
}
@media screen and (max-width: 767px){
.leftImages{
 display: none;
}
}
.phoneImg {
      width: 100%;
    border-radius: 25px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 280px;
}

.rightContent {
  text-align: center;
  max-width: 300px;
}
.backBtnWrapper {
  position: absolute;
  top: 20px;
  left: 20px;
}

.backButtonTop {
  background: #3b82f6;
  color: #fff;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
  transition: 0.3s ease;
}

.backButtonTop:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.35);
}

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
      `}</style>

<div className="pageWrapper">
<div className="backBtnWrapper">
  <Link href="/" className="backButtonTop">
    ← Back
  </Link>
</div>

  <div className="installContainer">
    
    {/* LEFT SIDE – Mobile App Images */}
    <div className="leftImages">
      <img src="/images/App_Image.png" className="phoneImg" alt="App Preview 1" />
    </div>

    {/* RIGHT SIDE – QR + Install Button */}
    <div className="rightContent">
      {/* <h1 className="title">Install Onshoper App</h1> */}
      {/* <p className="subtitle">Safe and secure</p> */}

      <div className="qrCard">
        <img
          src="/icons/tabOnshoper.png"
          alt="Scan to Install Onshoper App"
          className="qrImage"
        />
      </div>

      <InstallButton />
    </div>

  </div>
</div>

    </>
  );
}
