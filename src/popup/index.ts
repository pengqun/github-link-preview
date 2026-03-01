import { getSettings, saveSettings } from "@/utils/storage";

document.addEventListener("DOMContentLoaded", async () => {
  const optionsButton = document.getElementById("go-to-options")!;
  const enableToggle = document.getElementById(
    "enableToggle",
  ) as HTMLInputElement;

  optionsButton.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });

  const settings = await getSettings();
  enableToggle.checked = settings.enabled;

  enableToggle.addEventListener("change", () => {
    saveSettings({ enabled: enableToggle.checked });
  });
});
