export default function Offline() {
  return (
    <>
      <style>{`
        body{
            -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: 'Poppins', sans-serif;
        }
        .offlineWrapper {
          text-align: center;
          padding: 150px 0;
        }

        .offlineWrapper h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        @media screen and (max-width: 767px) {
          .offlineWrapper h1 {
            font-size: 25px;
            margin-bottom: 8px;
          }
        }

        .offlineWrapper p {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
        }

        @media screen and (max-width: 767px) {
          .offlineWrapper p {
            font-size: 14px;
          }
        }

        .offlineImage {
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }

        .retryButton {
          background: #daeefa;
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 40px;
        }

        @media screen and (max-width: 767px) {
          .retryButton {
            margin-top: 10px;
            font-size: 14px;
          }
        }

        .retryButton:hover {
          background: #b6d8ed;
          transform: scale(1.05);
        }

        .retryButton:active {
          transform: scale(0.95);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      `}</style>

      <div className="offlineWrapper">
        {/* <img
          src="/images/wifi.png"
          alt="No Internet"
          width={130}
          height={130}
          className="offlineImage"
        /> */}

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
          Refresh Page
        </button>
      </div>
    </>
  );
}
