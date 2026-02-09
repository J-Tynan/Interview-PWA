import { initShell } from './app/shell.js';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app');
  initShell(root);
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
