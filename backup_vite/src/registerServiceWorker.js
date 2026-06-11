// Register service worker for Progressive Web App offline experience
export function register() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Calyxo Service Worker registered successfully: ', reg.scope);
        })
        .catch(err => {
          console.warn('Calyxo Service Worker registration failed: ', err);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
