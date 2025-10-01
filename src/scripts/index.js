// -----------------------------
// index.js (final tambahan SW + Push)
// -----------------------------

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function showGlobalError(message) {
  const div = document.createElement('div');
  div.className = 'global-error';
  div.textContent = message;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add('fade-out');
    setTimeout(() => div.remove(), 500);
  }, 5000);
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  const msg = event.reason?.message || event.reason;
  showGlobalError(`⚠️ ${msg}`);
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const msg = event.error?.message || event.message;
  showGlobalError(`❌ ${msg}`);
});

// -----------------------------
// Service Worker Registration
// -----------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/Dicoding-Story-App/sw.js'); // ganti /story-app sesuai repo
      console.log('✅ Service Worker registered:', swReg.scope);

      // Request Notification permission otomatis
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
    } catch (err) {
      console.error('❌ SW registration failed:', err);
    }
  });

  if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/Dicoding-Story-App/sw.js"
      );
      console.log("SW registered:", registration.scope);
    } catch (err) {
      console.error("SW registration failed:", err);
    }
  });
}
}

import '../public/sw-register';
