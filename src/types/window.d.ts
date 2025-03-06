declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }

  interface Window {
    updateSW?: () => void;
    workbox?: {
      messageSkipWaiting(): void;
      register(): Promise<void>;
    };
    __WB_MANIFEST: Array<{
      revision: string | null;
      url: string;
    }>;
  }
}

// Ensure this is treated as a module
export {};
