import React, { useState, useEffect } from "react";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null; // If the connection is online, don't show anything

  return (
    <div style={styles.popup}>
      <p>Internet connection is slow or lost.</p>
    </div>
  );
};

const styles = {
  popup: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    fontWeight: "bold",
  },
};

export default ConnectionStatus;
