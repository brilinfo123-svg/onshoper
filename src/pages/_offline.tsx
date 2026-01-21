export default function Offline() {
  return (
    <>
      <link rel="stylesheet" href="/offline.css" />

      <div className="offlineWrapper">
        <img
          src="/images/wifi.png"
          alt="No Internet"
          width={130}
          height={130}
          className="offlineImage"
        />

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
