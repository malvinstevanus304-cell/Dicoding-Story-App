// src/scripts/sw-register.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/Dicoding-Story-App/sw.js')
      .then(reg => {
        console.log('✅ Service Worker registered with scope:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}
