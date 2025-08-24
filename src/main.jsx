import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Register SW AFTER render so install/activate happen cleanly
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js?bbuddy=v4") // <— bump this with the same v4
      .catch((err) => console.error("SW register failed", err));
  });
}