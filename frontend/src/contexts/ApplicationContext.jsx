import React, { createContext, useEffect, useReducer } from "react";
import axios from "../utils/axios";
import { socket } from "../socket";

const isValidToken = async (accessToken) => {
  if (!accessToken) {
    return false;
  }

  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    await axios.get("/api/whatsapp/token/validate");
    return true;
  } catch (error) {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common.Authorization;
    return false;
  }
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("token", accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common.Authorization;
  }
};

// ===========================================================================

const initialState = {
  isConnected: false,
  qr: null,
  isAuthenticated: false,
  isReady: false, // for splash screen
  user: null,
  message: null,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, isReady, user } = action.payload;
      return {
        ...state,
        isAuthenticated,
        isReady,
        user,
      };
    }
    case "QR": {
      const { qr } = action.payload;
      return {
        ...state,
        qr: `data:image/png;base64,${qr}`,
        message: "Scan QR Code...",
      };
    }
    case "CONNECTION": {
      const { isConnected } = action.payload;
      return {
        ...state,
        isConnected,
      };
    }
    case "AUTHENTICATION": {
      const { isAuthenticated } = action.payload;
      return {
        ...state,
        isAuthenticated,
      };
    }

    case "MESSAGE": {
      const { message } = action.payload;
      return {
        ...state,
        message,
      };
    }
    case "ERROR": {
      const { error } = action.payload;
      return {
        ...state,
        error,
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        isConnected: false,
        isAuthenticated: false,
        isReady: false,
        user: null,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const ApplicationContext = createContext({
  ...initialState,
  setQR: () => {},

  setMessage: () => {},
  setError: () => {},
  logout: () => Promise.resolve(),
});

export const ApplicationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("FIRST...");

    if (!localStorage.getItem("dark_mode")) {
      localStorage.setItem("dark_mode", "false");
    }

    function onConnect() {
      dispatch({
        type: "CONNECTION",
        payload: {
          isConnected: true,
        },
      });
    }
    function onDisconnect() {
      dispatch({
        type: "CONNECTION",
        payload: {
          isConnected: false,
        },
      });
    }
    function onInit({ from, is_authenticated, whatsapp_ready, user }) {
      console.log("context", { from, is_authenticated, whatsapp_ready, user });
      dispatch({
        type: "INIT",
        payload: {
          isAuthenticated: is_authenticated,
          isReady: whatsapp_ready ?? false,
          user,
        },
      });
    }
    function onQR(qr) {
      console.log({ qr });
      dispatch({
        type: "QR",
        payload: {
          qr,
        },
      });
    }
    function onLoadingScreen(message) {
      dispatch({
        type: "MESSAGE",
        payload: {
          message,
        },
      });
    }
    function onAuthenticated(isAuthenticated) {
      dispatch({
        type: "AUTHENTICATION",
        payload: {
          isAuthenticated,
        },
      });
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

  const setQR = (qr) => {
    dispatch({
      type: "QR",
      payload: {
        qr,
      },
    });
  };

  const setMessage = (message) => {
    dispatch({
      type: "MESSAGE",
      payload: {
        message,
      },
    });
  };
  const setError = (error) => {
    dispatch({
      type: "ERROR",
      payload: {
        error,
      },
    });
  };
  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <ApplicationContext.Provider
      value={{
        ...state,
        setQR,
        setMessage,
        setError,
        logout,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationContext;
