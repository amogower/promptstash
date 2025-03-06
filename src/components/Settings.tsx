import React from 'react';
import { Button } from './ui/button';
import { Save } from 'lucide-react';
import { useStore } from '@/lib/store';
import posthog from 'posthog-js';

interface Settings {
  autoSave: boolean;
}

export function Settings() {
  const { autoSave, updateSettings } = useStore();
  const [formData, setFormData] = React.useState<Settings>({
    autoSave,
  });
  const [themePreference, setThemePreference] = React.useState<'system' | 'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'system';
  });
  const [originalSettings, setOriginalSettings] = React.useState({
    autoSave,
    theme: themePreference
  });

  const hasChanges = React.useMemo(() => {
    return themePreference !== originalSettings.theme || 
           formData.autoSave !== originalSettings.autoSave;
  }, [formData.autoSave, originalSettings, themePreference]);

  const handleSave = () => {
    updateSettings(formData);
    
    // Handle theme changes
    if (themePreference === 'system') {
      localStorage.removeItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateSettings({ isDarkMode: systemDark });
      posthog.capture('settings:theme_changed', {
        theme: 'system',
        resulting_mode: systemDark ? 'dark' : 'light'
      });
    } else {
      const isDark = themePreference === 'dark';
      localStorage.setItem('theme', themePreference);
      updateSettings({ isDarkMode: isDark });
      posthog.capture('settings:theme_changed', {
        theme: themePreference,
        resulting_mode: isDark ? 'dark' : 'light'
      });
    }

    if (formData.autoSave !== originalSettings.autoSave) {
      posthog.capture('settings:autosave_changed', {
        enabled: formData.autoSave
      });
    }

    setOriginalSettings({
      autoSave: formData.autoSave,
      theme: themePreference
    });

    posthog.capture('settings:preferences_saved');
  };

  const handleThemeChange = (value: 'system' | 'light' | 'dark') => {
    setThemePreference(value);
    
    // Apply theme change immediately
    if (value === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
      posthog.capture('settings:theme_previewed', {
        theme: 'system',
        resulting_mode: systemDark ? 'dark' : 'light'
      });
    } else {
      const isDark = value === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      posthog.capture('settings:theme_previewed', {
        theme: value,
        resulting_mode: isDark ? 'dark' : 'light'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-lg font-medium mb-4">Interface Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground flex-1">
                Theme
              </span>
              <div className="flex gap-2">
                {(['system', 'light', 'dark'] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={themePreference === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange(theme)}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Auto-save Prompts
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer dark:peer"
                  checked={formData.autoSave}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setFormData(prev => ({ ...prev, autoSave: newValue }));
                    posthog.capture('settings:autosave_toggled', {
                      enabled: newValue
                    });
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}