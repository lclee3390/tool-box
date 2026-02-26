import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 註冊 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // 確保 service-worker.js 存在
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      // 等待 Service Worker 激活
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }

      // 強制激活
      await registration.update();
      if (registration.active) {
        registration.active.postMessage('init');
      }

      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  });
}
