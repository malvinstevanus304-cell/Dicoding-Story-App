// src/scripts/push.js

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribePush(registration) {
  const vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"; // ganti dengan key dari Dicoding
  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });

  console.log("✅ Subscribed:", subscription);

  await fetch("https://story-api.dicoding.dev/v1/#", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

export async function unsubscribePush(registration) {
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log("❌ Unsubscribed:", subscription);
    // TODO: panggil API untuk hapus subscription dari server
  }
}
