import React from "react";
import ReactDOM from "react-dom/client";
import { isTauri } from "@tauri-apps/api/core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import { GOOGLE_CLIENT_ID } from "./config.ts";
import { SessionProvider } from "./session/SessionContext.jsx";

const app = isTauri() ? (
  <App />
) : (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="ca">
    <SessionProvider>
      <App />
    </SessionProvider>
  </GoogleOAuthProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
