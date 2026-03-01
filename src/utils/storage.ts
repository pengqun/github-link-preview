import type { ExtensionSettings } from "@/types";

const DEFAULTS: Record<string, unknown> = {
  enabled: true,
  githubToken: "",
  popupDelay: 500,
};

export function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, (items) => {
      resolve(items as unknown as ExtensionSettings);
    });
  });
}

export function saveSettings(
  settings: Partial<ExtensionSettings>,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

export function onSettingsChange(
  callback: (changes: Partial<ExtensionSettings>) => void,
): void {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync") return;

    const updated: Partial<ExtensionSettings> = {};
    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULTS) {
        (updated as Record<string, unknown>)[key] = change.newValue;
      }
    }
    if (Object.keys(updated).length > 0) {
      callback(updated);
    }
  });
}
