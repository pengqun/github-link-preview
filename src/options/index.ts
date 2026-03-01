import { getSettings, saveSettings } from "@/utils/storage";

const DEFAULT_POPUP_DELAY = 500;

async function restoreOptions(): Promise<void> {
  const settings = await getSettings();
  (document.getElementById("github-token") as HTMLInputElement).value =
    settings.githubToken;
  (document.getElementById("popup-delay") as HTMLInputElement).value =
    String(settings.popupDelay);
}

async function handleSave(): Promise<void> {
  const githubToken = (
    document.getElementById("github-token") as HTMLInputElement
  ).value;
  const popupDelay =
    parseInt(
      (document.getElementById("popup-delay") as HTMLInputElement).value,
    ) || DEFAULT_POPUP_DELAY;

  await saveSettings({ githubToken, popupDelay });

  const status = document.getElementById("status")!;
  status.textContent = "Options saved.";
  setTimeout(() => {
    status.textContent = "";
  }, 1500);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector(".save-button")!.addEventListener("click", handleSave);
