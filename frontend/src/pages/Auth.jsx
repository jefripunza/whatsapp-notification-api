import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApplication from "./../hooks/useApplication";
import { socket } from "../socket";

import Loading from "../components/Loading";

function Auth() {
  const navigate = useNavigate();

  const { message, isConnected, isAuthenticated, isReady, qr } =
    useApplication();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isConnected, isReady, isAuthenticated]);

  return (
    <div>
      <div className="centered-fix">
        <div className="auth-card">
          <div className="head-card">
            <img
              src="https://wwebjs.dev/logo.png"
              alt="whatsapp notification api logo"
              style={{ width: "10rem", height: "10rem" }}
            />
            <div style={{ paddingLeft: 20 }}>
              <h1>WhatsApp Notification API</h1>
              <h2>{message}</h2>
              <div style={{ paddingTop: 20 }}>
                {qr ? (
                  <div className="h-100 d-flex align-items-center justify-content-center">
                    <img src={qr} alt="QR Code" />
                  </div>
                ) : (
                  <Loading type={"spin"} color={"#ccc"} size={30} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
