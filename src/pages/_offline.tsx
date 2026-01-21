export default function Offline() {
  return (
    <>
      <style>{`
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #f7f9fc, #eef4ff);
          margin: 0;
          padding: 0;
        }

        .offlineWrapper {
          text-align: center;
          padding: 20px;
          animation: fadeIn 0.8s ease-out;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Icon Circle */
        .iconCircle {
          width: 110px;
          height: 110px;
          margin: 0 auto 25px;
          border-radius: 50%;
          background: #e8f2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          animation: float 3s infinite ease-in-out;
        }

        .iconCircle span {
          font-size: 55px;
          color: #3b82f6;
        }

        .offlineWrapper h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 5px;
          color: #1e293b;
        }

        @media screen and (max-width: 767px) {
          .offlineWrapper h1 {
            font-size: 26px;
          }
        }

        .offlineWrapper p {
          font-size: 16px;
          color: #475569;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        @media screen and (max-width: 767px) {
          .offlineWrapper p {
            font-size: 14px;
          }
        }

        .retryButton {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        @media screen and (max-width: 767px) {
          .retryButton {
            font-size: 14px;
            padding: 10px 22px;
          }
        }

        .retryButton:hover {
          background: #2563eb;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.35);
        }

        .retryButton:active {
          transform: scale(0.96);
        }

        /* Animations */
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
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

      <div className="offlineWrapper">

        {/* Beautiful animated icon */}
        <div className="wrappers">
        <div className="iconCircle">
          <span>📡</span>
        </div>

        <h1>No Internet Connection</h1>
        <p>Please check your network and try again.</p>

        <button
          className="retryButton"
          onClick={() => {
            if (navigator.onLine) {
              window.location.href = "/";
            } else {
              window.location.reload();
            }
          }}
        >
          Try Again
        </button>
        </div>
      </div>
    </>
  );
}
