import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

import Loading from "../components/Loading";

function Auth() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("Please wait!");

  const [isSocketConnected, setSocketConnected] = useState(socket.connected);
  const [isConnected, setIsConnected] = useState(false);
  const [whatsappReady, setWhatsAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [qr_svg, setQR] = useState(false);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onInit({ whatsapp_ready, is_authenticated }) {
      setWhatsAppReady(whatsapp_ready);
      setIsAuthenticated(is_authenticated);
    }
    function onQR(qr) {
      console.log({ qr });
      setQR(`data:image/png;base64,${qr}`);
      setMessage("Scan QR Code...");
    }
    function onLoadingScreen(msg) {
      setMessage(msg);
      setQR(false);
    }
    function onAuthenticated(is_authenticated) {
      setIsAuthenticated(is_authenticated);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("init", onInit);
    socket.on("qr", onQR);
    socket.on("loading_screen", onLoadingScreen);
    socket.on("authenticated", onAuthenticated);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("init", onInit);
      socket.off("qr", onQR);
      socket.off("loading_screen", onLoadingScreen);
      socket.off("authenticated", onAuthenticated);
    };
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isConnected, whatsappReady, isAuthenticated]);

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
                {qr_svg ? (
                  <div className="h-100 d-flex align-items-center justify-content-center">
                    <img src={qr_svg} alt="QR Code" />
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
