// Calyxo VAPID Public & Private Keys for Web Push API

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BJEqrp7IotPHK2FR8qvgATPii4lV3KY3jirYWe1b6X9vRdY6rwbsnyCQiOR2J4VUHuP-eWLfX4cHAmhFqnWSBWs';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
