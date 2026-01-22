import InstallButton from "@/components/AppInstall/Index";
import Link from "next/link";

export default function InstallApp() {
  return (
    <>
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
        <div className="wraper">
          {/* <h1 className="title">Install Onshoper App</h1>

          <p className="subtitle">
            Safe and secure
          </p> */}
  
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
    </>
  );
}
