import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { API_BASE } from "./utils/api";

// Affiche l'URL API utilisée par l'application (utile pour vérifier la config de déploiement)
if (import.meta.env.PROD) {
  console.info("⚙️ API_BASE:", API_BASE);
  if (API_BASE.includes("localhost")) {
    console.warn(
      "⚠️ L'application utilise encore un backend local (localhost) en production. Assurez-vous de définir VITE_API_URL dans votre plateforme de déploiement."
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
