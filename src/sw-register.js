// sw-register.js
const BASE_PATH = "/Dicoding-Story-App";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${BASE_PATH}/sw.js`)
      .then((reg) => {
        console.log("✅ Service Worker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.error("❌ SW registration failed:", err);
      });
  });
}
