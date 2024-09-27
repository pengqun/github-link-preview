const DEFAULT_POPUP_DELAY = 500;

// Saves options to chrome.storage
const saveOptions = () => {
  const githubToken = document.getElementById("github-token").value;
  const popupDelay =
    parseInt(document.getElementById("popup-delay").value) ||
    DEFAULT_POPUP_DELAY;

  chrome.storage.sync.set({ githubToken, popupDelay }, () => {
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 1500);
  });
};

// Restores input box state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { githubToken: "", popupDelay: DEFAULT_POPUP_DELAY },
    (items) => {
      document.getElementById("github-token").value = items.githubToken;
      document.getElementById("popup-delay").value = items.popupDelay;
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector(".save-button").addEventListener("click", saveOptions);
