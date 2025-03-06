import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import posthog from 'posthog-js';
import App from './App.tsx';
import './index.css';

// Track PWA installation status
window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
  posthog.capture('pwa:prompt_shown');
  
  // Track when user installs the PWA
  e.userChoice.then((choiceResult) => {
    posthog.capture('pwa:prompt_responded', {
      outcome: choiceResult.outcome,
      platform: choiceResult.platform
    });
  });
});

// Track when PWA is successfully installed
window.addEventListener('appinstalled', () => {
  posthog.capture('pwa:app_installed');
});

// Track online/offline status
window.addEventListener('online', () => {
  posthog.capture('network:connection_restored');
});

window.addEventListener('offline', () => {
  posthog.capture('network:connection_lost');
});

// Initialize PostHog
posthog.init(
  import.meta.env.VITE_POSTHOG_KEY ?? '',
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
    persistence: 'localStorage',
    autocapture: true,
    capture_pageview: true,
    loaded: (posthog) => {
      // Add PWA display mode and installation status
      const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
      posthog.register({
        display_mode: displayMode,
        is_pwa: displayMode === 'standalone'
      });
    },
  }
);

// Register service worker with update tracking
const updateSW = registerSW({
  immediate: true,
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    // Track registration with service worker version
    posthog.capture('serviceworker:registration_successful', {
      registration: registration?.scope,
      version: registration?.active?.scriptURL || 'unknown'
    });
  },
  onNeedRefresh() {
    // New version available
    const registration = navigator.serviceWorker?.controller?.scriptURL;
    posthog.capture('pwa:update_available', {
      current_version: registration || 'unknown'
    });
  },
  onOfflineReady() {
    posthog.capture('pwa:offline_ready');
  },
});

// Track when user accepts or ignores PWA updates
if (updateSW) {
  window.updateSW = () => {
    posthog.capture('pwa:update_accepted');
    updateSW();
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
