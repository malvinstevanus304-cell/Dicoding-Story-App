import '../styles/styles.css';
import App from './pages/app';

// ===============================
// Init App
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

// ===============================
// Service Worker + Push
// ===============================
if ("serviceWorker" in navigator && "PushManager" in window) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("✅ Service Worker registered:", registration);

      // Request izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("✅ Notifikasi diizinkan");
        // langsung coba subscribe
        await subscribePush(registration);
      } else {
        console.warn("❌ User menolak notifikasi");
      }
    } catch (err) {
      console.error("❌ SW registration failed:", err);
    }
  });
}

// ===============================
// Helper: Convert VAPID Key
// ===============================
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ===============================
// Subscribe Push
// ===============================
export async function subscribePush(registration) {
  // VAPID Public Key dari Dicoding
  const vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    console.log("✅ Subscribed:", subscription);

    // Kirim ke API Dicoding
    await fetch("https://story-api.dicoding.dev/v1/push-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // pastikan token tersimpan
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (err) {
    console.error("❌ Gagal subscribe:", err);
  }
}

// ===============================
// Unsubscribe Push
// ===============================
export async function unsubscribePush(registration) {
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await fetch("https://story-api.dicoding.dev/v1/push-subscribe", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(subscription),
    });

    await subscription.unsubscribe();
    console.log("❌ Unsubscribed:", subscription);
  }
}
