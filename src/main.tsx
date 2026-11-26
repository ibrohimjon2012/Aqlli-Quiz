import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

try {
  registerSW({ immediate: true });
} catch {
  // Service Worker qo'llab-quvvatlanmasa ilova ishlashda davom etadi
}

createRoot(document.getElementById('root')!).render(<App />);
