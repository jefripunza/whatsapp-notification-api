import React, { useEffect } from "react";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = ({ children }) => {
  useEffect(() => {
    // handle anchor button
    document.addEventListener("click", function (event) {
      event.preventDefault(); // Don't navigate!
      const anchor = event.target.closest("a"); // Find closest Anchor (or self)
      if (!anchor) return; // Not found. Exit here.
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (String(href).startsWith("#")) {
        const id = String(href).replaceAll("#", "");
        if (document.getElementById(id)) {
          document.getElementById(id).scrollIntoView({
            behavior: "smooth",
          });
        }
      } else if (target === "_blank") {
        window.open(href, "_blank").focus();
      }
    });
    // ===========================================================
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, []);

  return (
    <>
      <ApplicationProvider>{children}</ApplicationProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;
