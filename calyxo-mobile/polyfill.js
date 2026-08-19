// Direct inline global polyfills for Hermes engine
if (typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = function DOMException(message, name) {
    var err = new Error(message || '');
    err.name = name || 'Error';
    return err;
  };
}
if (typeof global !== 'undefined' && typeof global.DOMException === 'undefined') {
  global.DOMException = globalThis.DOMException;
}

if (typeof globalThis.FormData === 'undefined') {
  try {
    globalThis.FormData = require('react-native/Libraries/Network/FormData').default;
  } catch (e) {}
}
if (typeof global !== 'undefined' && globalThis.FormData && typeof global.FormData === 'undefined') {
  global.FormData = globalThis.FormData;
}
